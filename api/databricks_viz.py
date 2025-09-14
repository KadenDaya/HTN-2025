"""
Databricks Data Visualization Integration
Syncs SQLite data to Databricks for advanced analytics and visualization
Perfect for showcasing Databricks capabilities at events!
"""
import os
import json
import sqlite3
from typing import Dict, List, Any, Optional
from databricks import sql
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime, timedelta
import requests

load_dotenv()

# Databricks Configuration
DATABRICKS_HOST = os.getenv("DATABRICKS_HOST", "dbc-4583e2a1-3d51.cloud.databricks.com")
DATABRICKS_HTTP_PATH = os.getenv("DATABRICKS_HTTP_PATH", "/sql/1.0/warehouses/24e8ffcb0690a53c")
DATABRICKS_TOKEN = os.getenv("DATABRICKS_TOKEN", "REPLACE_ME")
DATABRICKS_SCHEMA = os.getenv("DATABRICKS_SCHEMA", "finance")

# SQLite Database
SQLITE_DB = os.path.join(os.path.dirname(__file__), "finance.db")

class DatabricksVisualizer:
    """Databricks integration for advanced data visualization and analytics"""
    
    def __init__(self):
        self.host = DATABRICKS_HOST
        self.http_path = DATABRICKS_HTTP_PATH
        self.token = DATABRICKS_TOKEN
        self.schema = DATABRICKS_SCHEMA
        
    def test_connection(self) -> Dict[str, Any]:
        """Test Databricks connection for visualization features"""
        try:
            # Add timeout to prevent hanging
            import signal
            
            def timeout_handler(signum, frame):
                raise TimeoutError("Databricks connection timed out")
            
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(5)  # 5 second timeout
            
            try:
                with sql.connect(
                    server_hostname=self.host,
                    http_path=self.http_path,
                    access_token=self.token
                ) as conn:
                    cur = conn.cursor()
                    cur.execute("SELECT 1 as test, current_timestamp() as timestamp")
                    result = cur.fetchone()
                    signal.alarm(0)  # Cancel timeout
                    return {
                        "status": "success",
                        "message": "Databricks visualization engine ready!",
                        "test_result": result[0],
                        "timestamp": str(result[1]),
                        "host": self.host
                    }
            except Exception as e:
                signal.alarm(0)  # Cancel timeout
                raise e
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Databricks connection failed: {str(e)}",
                "host": self.host,
                "note": "Using mock data for demo - this is normal in development"
            }
    
    def sync_sqlite_to_databricks(self) -> Dict[str, Any]:
        """Sync SQLite data to Databricks for visualization"""
        try:
            # Read data from SQLite
            sqlite_conn = sqlite3.connect(SQLITE_DB)
            sqlite_conn.row_factory = sqlite3.Row
            
            # Get all transactions
            transactions_df = pd.read_sql_query("""
                SELECT * FROM transactions 
                ORDER BY transaction_date DESC
            """, sqlite_conn)
            
            # Get all statements
            statements_df = pd.read_sql_query("""
                SELECT * FROM statements
                ORDER BY inserted_at DESC
            """, sqlite_conn)
            
            sqlite_conn.close()
            
            if len(transactions_df) == 0:
                return {
                    "status": "no_data",
                    "message": "No data to sync - upload some statements first!",
                    "synced_records": 0
                }
            
            # Connect to Databricks and sync data
            with sql.connect(
                server_hostname=self.host,
                http_path=self.http_path,
                access_token=self.token
            ) as conn:
                cur = conn.cursor()
                
                # Create schema and tables if they don't exist
                self._ensure_databricks_schema(cur)
                
                # Clear existing data for fresh sync
                cur.execute(f"DELETE FROM `{self.schema}`.`transactions`")
                cur.execute(f"DELETE FROM `{self.schema}`.`statements`")
                
                # Insert transactions
                for _, row in transactions_df.iterrows():
                    cur.execute(f"""
                    INSERT INTO `{self.schema}`.`transactions` 
                    (statement_id, ref_number, transaction_date, post_date, description, amount, location)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        row['statement_id'], row['ref_number'], row['transaction_date'],
                        row['post_date'], row['description'], row['amount'], row['location']
                    ))
                
                # Insert statements
                for _, row in statements_df.iterrows():
                    cur.execute(f"""
                    INSERT INTO `{self.schema}`.`statements`
                    (statement_id, user_id, bank_name, card_type, period_start, period_end,
                     statement_date, account_number, ending_balance, minimum_payment, 
                     payment_due_date, customer_name, raw_json, inserted_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        row['statement_id'], row['user_id'], row['bank_name'], row['card_type'],
                        row['period_start'], row['period_end'], row['statement_date'],
                        row['account_number'], row['ending_balance'], row['minimum_payment'],
                        row['payment_due_date'], row['customer_name'], row['raw_json'], row['inserted_at']
                    ))
                
                conn.commit()
                
                return {
                    "status": "success",
                    "message": "Data synced to Databricks successfully!",
                    "synced_records": {
                        "transactions": len(transactions_df),
                        "statements": len(statements_df)
                    },
                    "databricks_ready": True
                }
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Sync failed: {str(e)}",
                "synced_records": 0
            }
    
    def _ensure_databricks_schema(self, cursor):
        """Create Databricks schema and tables for visualization"""
        # Create schema
        cursor.execute(f"CREATE SCHEMA IF NOT EXISTS `{self.schema}`")
        cursor.execute(f"USE `{self.schema}`")
        
        # Create transactions table optimized for analytics
        cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS `{self.schema}`.`transactions` (
            statement_id STRING,
            ref_number STRING,
            transaction_date DATE,
            post_date DATE,
            description STRING,
            amount DECIMAL(18,2),
            location STRING,
            created_at TIMESTAMP DEFAULT current_timestamp()
        ) USING DELTA
        TBLPROPERTIES (
            delta.autoOptimize.optimizeWrite = true,
            delta.autoOptimize.autoCompact = true
        )
        """)
        
        # Create statements table
        cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS `{self.schema}`.`statements` (
            statement_id STRING PRIMARY KEY,
            user_id STRING,
            bank_name STRING,
            card_type STRING,
            period_start DATE,
            period_end DATE,
            statement_date DATE,
            account_number STRING,
            ending_balance DECIMAL(18,2),
            minimum_payment DECIMAL(18,2),
            payment_due_date DATE,
            customer_name STRING,
            raw_json STRING,
            inserted_at TIMESTAMP
        ) USING DELTA
        """)
    
    def get_advanced_analytics(self) -> Dict[str, Any]:
        """Get advanced analytics from Databricks for visualization"""
        try:
            with sql.connect(
                server_hostname=self.host,
                http_path=self.http_path,
                access_token=self.token
            ) as conn:
                cur = conn.cursor()
                
                # Advanced spending patterns analysis
                cur.execute(f"""
                SELECT 
                    DATE_FORMAT(transaction_date, 'yyyy-MM') as month,
                    CASE 
                        WHEN UPPER(description) LIKE '%PRESTO%' OR UPPER(description) LIKE '%METROLINX%' THEN 'Transportation'
                        WHEN UPPER(description) LIKE '%SOBEYS%' OR UPPER(description) LIKE '%FOOD%' OR UPPER(description) LIKE '%WALMART%' THEN 'Groceries'
                        WHEN UPPER(description) LIKE '%MCDONALD%' OR UPPER(description) LIKE '%RESTAURANT%' OR UPPER(description) LIKE '%UBER%' THEN 'Dining'
                        WHEN UPPER(description) LIKE '%SPOTIFY%' OR UPPER(description) LIKE '%NETFLIX%' THEN 'Entertainment'
                        ELSE 'Other'
                    END as category,
                    COUNT(*) as transaction_count,
                    SUM(ABS(amount)) as total_amount,
                    AVG(ABS(amount)) as avg_amount,
                    MIN(ABS(amount)) as min_amount,
                    MAX(ABS(amount)) as max_amount
                FROM `{self.schema}`.`transactions`
                WHERE amount < 0
                GROUP BY 1, 2
                ORDER BY month DESC, total_amount DESC
                """)
                spending_patterns = cur.fetchall()
                
                # Weekly spending trends
                cur.execute(f"""
                SELECT 
                    DATE_FORMAT(transaction_date, 'EEEE') as day_of_week,
                    HOUR(COALESCE(post_date, transaction_date)) as hour_of_day,
                    COUNT(*) as transaction_count,
                    SUM(ABS(amount)) as total_spent
                FROM `{self.schema}`.`transactions`
                WHERE amount < 0
                GROUP BY 1, 2
                ORDER BY 
                    CASE day_of_week 
                        WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 
                        WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 
                        WHEN 'Sunday' THEN 7 
                    END,
                    hour_of_day
                """)
                time_patterns = cur.fetchall()
                
                # Location-based spending
                cur.execute(f"""
                SELECT 
                    COALESCE(location, 'Unknown') as location,
                    COUNT(*) as visits,
                    SUM(ABS(amount)) as total_spent,
                    AVG(ABS(amount)) as avg_per_visit
                FROM `{self.schema}`.`transactions`
                WHERE amount < 0 AND location IS NOT NULL
                GROUP BY location
                ORDER BY total_spent DESC
                LIMIT 10
                """)
                location_analysis = cur.fetchall()
                
                return {
                    "status": "success",
                    "analytics": {
                        "spending_patterns": [dict(zip([col[0] for col in cur.description], row)) for row in spending_patterns],
                        "time_patterns": [dict(zip([col[0] for col in cur.description], row)) for row in time_patterns],
                        "location_analysis": [dict(zip([col[0] for col in cur.description], row)) for row in location_analysis]
                    },
                    "powered_by": "Databricks Analytics Engine"
                }
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Analytics failed: {str(e)}",
                "analytics": {}
            }
    
    def generate_databricks_dashboard_url(self) -> str:
        """Generate URL for Databricks dashboard (for demo purposes)"""
        return f"https://{self.host}/sql/dashboards/your-dashboard-id"
    
    def get_demo_queries(self) -> List[Dict[str, str]]:
        """Get demo SQL queries to showcase Databricks capabilities"""
        return [
            {
                "title": "💰 Advanced Spending Analysis",
                "description": "Complex aggregations with window functions",
                "query": f"""
                SELECT 
                    transaction_date,
                    description,
                    amount,
                    SUM(ABS(amount)) OVER (
                        ORDER BY transaction_date 
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                    ) as running_total,
                    LAG(ABS(amount), 1) OVER (ORDER BY transaction_date) as prev_amount,
                    CASE 
                        WHEN ABS(amount) > AVG(ABS(amount)) OVER () THEN 'Above Average'
                        ELSE 'Below Average'
                    END as spending_category
                FROM `{self.schema}`.`transactions`
                WHERE amount < 0
                ORDER BY transaction_date DESC
                """
            },
            {
                "title": "📊 Category Performance with ML Insights",
                "description": "Statistical analysis with percentiles",
                "query": f"""
                SELECT 
                    category,
                    COUNT(*) as transactions,
                    SUM(total_amount) as total_spent,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_amount) as median_spend,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_amount) as p95_spend,
                    STDDEV(total_amount) as spending_volatility
                FROM (
                    SELECT 
                        CASE 
                            WHEN UPPER(description) LIKE '%PRESTO%' THEN 'Transportation'
                            WHEN UPPER(description) LIKE '%SOBEYS%' THEN 'Groceries'
                            WHEN UPPER(description) LIKE '%MCDONALD%' THEN 'Dining'
                            ELSE 'Other'
                        END as category,
                        ABS(amount) as total_amount
                    FROM `{self.schema}`.`transactions`
                    WHERE amount < 0
                ) t
                GROUP BY category
                ORDER BY total_spent DESC
                """
            },
            {
                "title": "🕒 Time Series Forecasting Data",
                "description": "Prepare data for ML forecasting models",
                "query": f"""
                SELECT 
                    DATE_TRUNC('week', transaction_date) as week_start,
                    COUNT(*) as weekly_transactions,
                    SUM(ABS(amount)) as weekly_spending,
                    AVG(ABS(amount)) as avg_transaction_size,
                    COUNT(DISTINCT DATE(transaction_date)) as active_days,
                    SUM(ABS(amount)) / COUNT(DISTINCT DATE(transaction_date)) as daily_avg_spending
                FROM `{self.schema}`.`transactions`
                WHERE amount < 0
                GROUP BY DATE_TRUNC('week', transaction_date)
                ORDER BY week_start
                """
            }
        ]

# Global instance
databricks_viz = DatabricksVisualizer()

def get_databricks_showcase() -> Dict[str, Any]:
    """Get comprehensive Databricks showcase data for the event"""
    return {
        "connection_test": databricks_viz.test_connection(),
        "demo_queries": databricks_viz.get_demo_queries(),
        "dashboard_url": databricks_viz.generate_databricks_dashboard_url(),
        "capabilities": [
            "🚀 Delta Lake for ACID transactions",
            "📊 Advanced SQL analytics with window functions", 
            "🤖 Built-in ML capabilities with MLflow",
            "⚡ Auto-scaling compute clusters",
            "🔄 Real-time streaming analytics",
            "📈 Interactive dashboards and visualizations"
        ],
        "event_ready": True
    }
