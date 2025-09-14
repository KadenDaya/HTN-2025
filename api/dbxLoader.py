# dbx_loader.py
from databricks import sql
from decimal import Decimal, ROUND_HALF_UP
import hashlib, json, os
from typing import Any, Dict, Iterable, Tuple, Optional
from dotenv import load_dotenv

load_dotenv()

SCHEMA  = os.getenv("DATABRICKS_SCHEMA", "finance")
CATALOG = os.getenv("DATABRICKS_CATALOG") 
HOST    = os.getenv("DATABRICKS_HOST", "dbc-4583e2a1-3d51.cloud.databricks.com")
HTTP_PATH = os.getenv("DATABRICKS_HTTP_PATH", "/sql/1.0/warehouses/24e8ffcb0690a53c")
TOKEN   = os.getenv("DATABRICKS_TOKEN", "REPLACE_ME")

def _qname(table: str) -> str:
    # Return fully-qualified table name, with optional catalog
    if CATALOG:
        return f"`{CATALOG}`.`{SCHEMA}`.`{table}`"
    return f"`{SCHEMA}`.`{table}`"

def _dec(n: Optional[float]) -> Optional[Decimal]:
    if n is None:
        return None
    # quantize to 2 decimals for currency
    return Decimal(str(n)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def _mk_statement_id(stmt: Dict[str, Any], user_id: str) -> str:
    md   = stmt.get("statement_metadata", {})
    acct = md.get("account_number", "")
    start = (md.get("statement_period") or {}).get("start", "")
    end   = (md.get("statement_period") or {}).get("end", "")
    sdate = md.get("statement_date", "")
    key   = f"{user_id}|{acct}|{start}|{end}|{sdate}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()  # 40-char

def _ensure_schema(cur) -> None:
    if CATALOG:
        cur.execute(f"CREATE CATALOG IF NOT EXISTS `{CATALOG}`")
        cur.execute(f"USE CATALOG `{CATALOG}`")
    cur.execute(f"CREATE SCHEMA IF NOT EXISTS `{SCHEMA}`")
    cur.execute(f"USE `{SCHEMA}`")

    cur.execute(f"""
    CREATE TABLE IF NOT EXISTS {_qname("statements")} (
      statement_id STRING,
      user_id STRING,
      bank_name STRING,
      card_type STRING,
      period_start DATE,
      period_end DATE,
      statement_date DATE,
      account_number STRING,
      page_current INT,
      page_total INT,
      subtotal_credits DECIMAL(18,2),
      subtotal_debits DECIMAL(18,2),
      interest_charges DECIMAL(18,2),
      cash_advances DECIMAL(18,2),
      purchases DECIMAL(18,2),
      ending_balance DECIMAL(18,2),
      minimum_payment DECIMAL(18,2),
      payment_due_date DATE,
      customer_name STRING,
      customer_address STRING,
      customer_email STRING,
      contact_support_json STRING,
      raw_json STRING,
      inserted_at TIMESTAMP
    ) USING DELTA
    TBLPROPERTIES (
      delta.autoOptimize.optimizeWrite = true,
      delta.autoOptimize.autoCompact = true
    )
    """)

    cur.execute(f"""
    CREATE TABLE IF NOT EXISTS {_qname("transactions")} (
      statement_id STRING,
      ref_number STRING,
      transaction_date DATE,
      post_date DATE,
      description STRING,
      amount DECIMAL(18,2),
      location STRING
    ) USING DELTA
    """)

    cur.execute(f"""
    CREATE TABLE IF NOT EXISTS {_qname("promotions")} (
      statement_id STRING,
      description STRING,
      rate STRING,
      ending_balance DECIMAL(18,2),
      expiry STRING
    ) USING DELTA
    """)

    cur.execute(f"""
    CREATE TABLE IF NOT EXISTS {_qname("disclosures")} (
      statement_id STRING,
      disclosure STRING
    ) USING DELTA
    """)

def _build_tx_rows(stmt_id: str, txs: Iterable[Dict[str, Any]]) -> Iterable[Tuple]:
    for t in txs or []:
        yield (
            stmt_id,
            t.get("ref_number"),
            t.get("transaction_date"),
            t.get("post_date"),
            t.get("description"),
            _dec(t.get("amount")),
            t.get("location"),
        )

def _build_promo_rows(stmt_id: str, promos: Iterable[Dict[str, Any]]) -> Iterable[Tuple]:
    for p in promos or []:
        yield (
            stmt_id,
            p.get("description"),
            p.get("rate"),
            _dec(p.get("ending_balance")),
            p.get("expiry"),
        )

def _build_disclosure_rows(stmt_id: str, disclosures: Iterable[str]) -> Iterable[Tuple]:
    for d in disclosures or []:
        yield (stmt_id, d)

def upload_statement_to_databricks(statement: Dict[str, Any], user_id: str,
                                   server_hostname: str = HOST,
                                   http_path: str = HTTP_PATH,
                                   access_token: str = TOKEN) -> str:
    """
    Ingest one credit-card statement JSON + user_id into Databricks SQL Warehouse.
    Returns the deterministic statement_id.
    """
    statement_id = _mk_statement_id(statement, user_id)
    md = statement.get("statement_metadata", {}) or {}
    cust = statement.get("customer_info", {}) or {}
    totals = statement.get("totals", {}) or {}
    contact_support_json = json.dumps(statement.get("contact_support_info") or statement.get("contact_info") or {}, ensure_ascii=False)
    raw_json = json.dumps(statement, ensure_ascii=False)

    # Flatten main columns
    row = {
        "statement_id": statement_id,
        "user_id": user_id,
        "bank_name": md.get("bank_name"),
        "card_type": md.get("card_type"),
        "period_start": (md.get("statement_period") or {}).get("start"),
        "period_end":   (md.get("statement_period") or {}).get("end"),
        "statement_date": md.get("statement_date"),
        "account_number": md.get("account_number"),
        "page_current": (md.get("page") or {}).get("current"),
        "page_total":   (md.get("page") or {}).get("total"),
        "subtotal_credits": _dec(totals.get("subtotal_credits")),
        "subtotal_debits":  _dec(totals.get("subtotal_debits")),
        "interest_charges": _dec(totals.get("interest_charges")),
        "cash_advances":    _dec(totals.get("cash_advances")),
        "purchases":        _dec(totals.get("purchases")),
        "ending_balance":   _dec(totals.get("ending_balance")),
        "minimum_payment":  _dec(totals.get("minimum_payment")),
        "payment_due_date": totals.get("payment_due_date"),
        "customer_name": cust.get("name"),
        "customer_address": cust.get("address"),
        "customer_email": cust.get("email"),
        "contact_support_json": contact_support_json,
        "raw_json": raw_json,
    }

    with sql.connect(server_hostname=server_hostname, http_path=http_path, access_token=access_token) as conn:
        cur = conn.cursor()
        _ensure_schema(cur)

        # Upsert the statements row (MERGE for idempotency)
        merge_sql = f"""
        MERGE INTO {_qname("statements")} AS t
        USING (
          SELECT
            ? AS statement_id, ? AS user_id, ? AS bank_name, ? AS card_type,
            ? AS period_start, ? AS period_end, ? AS statement_date, ? AS account_number,
            CAST(? AS INT) AS page_current, CAST(? AS INT) AS page_total,
            CAST(? AS DECIMAL(18,2)) AS subtotal_credits,
            CAST(? AS DECIMAL(18,2)) AS subtotal_debits,
            CAST(? AS DECIMAL(18,2)) AS interest_charges,
            CAST(? AS DECIMAL(18,2)) AS cash_advances,
            CAST(? AS DECIMAL(18,2)) AS purchases,
            CAST(? AS DECIMAL(18,2)) AS ending_balance,
            CAST(? AS DECIMAL(18,2)) AS minimum_payment,
            ? AS payment_due_date,
            ? AS customer_name, ? AS customer_address, ? AS customer_email,
            ? AS contact_support_json,
            ? AS raw_json,
            current_timestamp() AS inserted_at
        ) s
        ON t.statement_id = s.statement_id
        WHEN MATCHED THEN UPDATE SET
          user_id = s.user_id,
          bank_name = s.bank_name,
          card_type = s.card_type,
          period_start = s.period_start,
          period_end = s.period_end,
          statement_date = s.statement_date,
          account_number = s.account_number,
          page_current = s.page_current,
          page_total = s.page_total,
          subtotal_credits = s.subtotal_credits,
          subtotal_debits  = s.subtotal_debits,
          interest_charges = s.interest_charges,
          cash_advances    = s.cash_advances,
          purchases        = s.purchases,
          ending_balance   = s.ending_balance,
          minimum_payment  = s.minimum_payment,
          payment_due_date = s.payment_due_date,
          customer_name    = s.customer_name,
          customer_address = s.customer_address,
          customer_email   = s.customer_email,
          contact_support_json = s.contact_support_json,
          raw_json = s.raw_json,
          inserted_at = s.inserted_at
        WHEN NOT MATCHED THEN INSERT *
        """
        cur.execute(merge_sql, (
            row["statement_id"], row["user_id"], row["bank_name"], row["card_type"],
            row["period_start"], row["period_end"], row["statement_date"], row["account_number"],
            row["page_current"], row["page_total"],
            row["subtotal_credits"], row["subtotal_debits"], row["interest_charges"],
            row["cash_advances"], row["purchases"], row["ending_balance"],
            row["minimum_payment"], row["payment_due_date"],
            row["customer_name"], row["customer_address"], row["customer_email"],
            row["contact_support_json"], row["raw_json"]
        ))

        # Child tables: replace existing rows for this statement_id for simplicity + speed
        tx_rows = list(_build_tx_rows(statement_id, statement.get("transactions")))
        promo_rows = list(_build_promo_rows(statement_id, statement.get("promotions")))
        disc_rows = list(_build_disclosure_rows(statement_id, statement.get("disclosures")))

        if tx_rows:
            cur.execute(f"DELETE FROM {_qname('transactions')} WHERE statement_id = ?", (statement_id,))
            cur.executemany(
                f"INSERT INTO {_qname('transactions')} "
                "(statement_id, ref_number, transaction_date, post_date, description, amount, location) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                tx_rows
            )

        if promo_rows:
            cur.execute(f"DELETE FROM {_qname('promotions')} WHERE statement_id = ?", (statement_id,))
            cur.executemany(
                f"INSERT INTO {_qname('promotions')} "
                "(statement_id, description, rate, ending_balance, expiry) "
                "VALUES (?, ?, ?, ?, ?)",
                promo_rows
            )

        if disc_rows:
            cur.execute(f"DELETE FROM {_qname('disclosures')} WHERE statement_id = ?", (statement_id,))
            cur.executemany(
                f"INSERT INTO {_qname('disclosures')} (statement_id, disclosure) VALUES (?, ?)",
                disc_rows
            )

        # Optional: curate files with OPTIMIZE/ZORDER for better read perf on statement_id/date
        # cur.execute(f"OPTIMIZE {_qname('transactions')} ZORDER BY (statement_id, transaction_date)")

        # Autocommit is on, but calling commit() is harmless
        try:
            conn.commit()
        except Exception:
            pass

        cur.close()

    return statement_id
