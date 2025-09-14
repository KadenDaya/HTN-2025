-- 📊 DATABRICKS SQL QUERIES FOR YOUR FINANCIAL DATA VISUALIZATION

-- 1. 💰 SPENDING OVERVIEW
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_credits,
    AVG(CASE WHEN amount < 0 THEN ABS(amount) ELSE NULL END) as avg_transaction
FROM finance.transactions;

-- 2. 📈 DAILY SPENDING TREND
SELECT 
    transaction_date,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as daily_spending,
    COUNT(*) as transaction_count
FROM finance.transactions 
WHERE amount < 0
GROUP BY transaction_date
ORDER BY transaction_date;

-- 3. 🏪 TOP SPENDING CATEGORIES (by merchant)
SELECT 
    CASE 
        WHEN UPPER(description) LIKE '%PRESTO%' OR UPPER(description) LIKE '%METROLINX%' THEN 'Transportation'
        WHEN UPPER(description) LIKE '%SOBEYS%' OR UPPER(description) LIKE '%FOOD BASICS%' OR UPPER(description) LIKE '%WAL-MART%' THEN 'Groceries'
        WHEN UPPER(description) LIKE '%MCDONALD%' OR UPPER(description) LIKE '%HARVEY%' OR UPPER(description) LIKE '%CHIPOTLE%' OR UPPER(description) LIKE '%THAI%' OR UPPER(description) LIKE '%UBER%' THEN 'Dining'
        WHEN UPPER(description) LIKE '%SPOTIFY%' THEN 'Entertainment'
        WHEN UPPER(description) LIKE '%UNIV%' OR UPPER(description) LIKE '%ACT*%' THEN 'Education'
        ELSE 'Other'
    END as category,
    COUNT(*) as transaction_count,
    SUM(ABS(amount)) as total_amount,
    AVG(ABS(amount)) as avg_amount
FROM finance.transactions 
WHERE amount < 0
GROUP BY 1
ORDER BY total_amount DESC;

-- 4. 📍 SPENDING BY LOCATION
SELECT 
    location,
    COUNT(*) as transactions,
    SUM(ABS(amount)) as total_spent
FROM finance.transactions 
WHERE amount < 0 AND location IS NOT NULL
GROUP BY location
ORDER BY total_spent DESC;

-- 5. 💳 RECENT TRANSACTIONS (Last 10)
SELECT 
    transaction_date,
    description,
    amount,
    location
FROM finance.transactions 
ORDER BY transaction_date DESC, post_date DESC
LIMIT 10;

-- 6. 📊 MONTHLY SPENDING SUMMARY
SELECT 
    DATE_FORMAT(transaction_date, 'yyyy-MM') as month,
    COUNT(*) as transactions,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as spending,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as credits
FROM finance.transactions
GROUP BY DATE_FORMAT(transaction_date, 'yyyy-MM')
ORDER BY month DESC;

-- 7. 🎯 STATEMENT OVERVIEW
SELECT 
    s.statement_id,
    s.bank_name,
    s.card_type,
    s.statement_period_start,
    s.statement_period_end,
    s.ending_balance,
    s.minimum_payment,
    s.payment_due_date,
    COUNT(t.ref_number) as transaction_count
FROM finance.statements s
LEFT JOIN finance.transactions t ON s.statement_id = t.statement_id
GROUP BY s.statement_id, s.bank_name, s.card_type, s.statement_period_start, 
         s.statement_period_end, s.ending_balance, s.minimum_payment, s.payment_due_date
ORDER BY s.statement_period_end DESC;
