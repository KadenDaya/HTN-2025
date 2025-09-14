#!/usr/bin/env python3
"""
🚀 Databricks Event Demo Script
Perfect for showcasing your Databricks integration at the event!
"""
import requests
import json
import time
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000"

def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"🎯 {title}")
    print("="*60)

def make_request(endpoint: str, method: str = "GET") -> Dict[str, Any]:
    """Make API request and return JSON response"""
    try:
        url = f"{BASE_URL}{endpoint}"
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"HTTP {response.status_code}", "message": response.text}
    except Exception as e:
        return {"error": "Connection failed", "message": str(e)}

def demo_databricks_showcase():
    """Demo the Databricks showcase features"""
    print_section("DATABRICKS EVENT SHOWCASE DEMO")
    
    # 1. Test basic database
    print("\n1️⃣ Testing Database Connection...")
    db_test = make_request("/test-database")
    print(f"✅ Database Status: {db_test.get('status', 'unknown')}")
    print(f"📊 Database Type: {db_test.get('database_type', 'unknown')}")
    
    # 2. Show Databricks showcase
    print("\n2️⃣ Databricks Capabilities Showcase...")
    showcase = make_request("/api/v1/databricks/showcase")
    if "showcase" in showcase:
        capabilities = showcase["showcase"].get("capabilities", [])
        print("🚀 Databricks Features:")
        for capability in capabilities:
            print(f"   {capability}")
        
        demo_queries = showcase["showcase"].get("demo_queries", [])
        print(f"\n📝 Available Demo Queries: {len(demo_queries)}")
        for i, query in enumerate(demo_queries[:2], 1):  # Show first 2
            print(f"   {i}. {query['title']}")
            print(f"      {query['description']}")
    
    # 3. Test data sync (if you have data)
    print("\n3️⃣ Data Sync to Databricks...")
    sync_result = make_request("/api/v1/databricks/sync", "POST")
    print(f"🔄 Sync Status: {sync_result.get('sync_result', {}).get('status', 'unknown')}")
    
    # 4. Advanced analytics
    print("\n4️⃣ Advanced Analytics Demo...")
    analytics = make_request("/api/v1/databricks/analytics")
    if "analytics" in analytics:
        print("📊 Analytics Features:")
        features = analytics.get("features_used", [])
        for feature in features:
            print(f"   ✨ {feature}")
    
    print_section("DEMO COMPLETE - READY FOR EVENT! 🎉")
    print("🎯 Key Points for Your Presentation:")
    print("   • Hybrid architecture: SQLite + Databricks")
    print("   • Real-time data sync capabilities") 
    print("   • Advanced SQL analytics with window functions")
    print("   • Delta Lake for data reliability")
    print("   • ML-ready data transformations")
    print("   • Interactive dashboards and visualizations")

def demo_api_endpoints():
    """Show all available API endpoints for the demo"""
    print_section("API ENDPOINTS FOR DEMO")
    
    endpoints = [
        ("GET", "/test-database", "Test database connection"),
        ("GET", "/api/v1/dashboard", "Get dashboard data"),
        ("GET", "/api/v1/databricks/showcase", "Databricks capabilities showcase"),
        ("POST", "/api/v1/databricks/sync", "Sync data to Databricks"),
        ("GET", "/api/v1/databricks/analytics", "Advanced analytics"),
        ("POST", "/upload", "Upload financial statements"),
        ("POST", "/api/v1/house-analysis", "House buying analysis")
    ]
    
    print("🔗 Available API Endpoints:")
    for method, endpoint, description in endpoints:
        print(f"   {method:4} {endpoint:35} - {description}")
    
    print(f"\n🌐 Base URL: {BASE_URL}")
    print("💡 Tip: Use these endpoints in your frontend demo!")

if __name__ == "__main__":
    print("🚀 Starting Databricks Event Demo...")
    print("📋 Make sure your server is running: python3 api/main.py")
    
    # Wait for server
    print("\n⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    # Run demos
    demo_api_endpoints()
    demo_databricks_showcase()
    
    print("\n🎊 Demo script complete! Your project is event-ready!")
    print("💡 Pro tip: Run this script during your presentation to show live data!")
