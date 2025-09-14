#!/bin/bash

# 🚀 Quick Start Script - Minimal setup for fast demo
# Use this when you just need to get everything running quickly

echo "🚀 Quick Starting Databricks Demo..."

# Kill any existing processes
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "🗄️ Initializing database..."
python3 api/sqlite_db.py

echo "🖥️ Starting backend server..."
python3 api/main.py > backend.log 2>&1 &

echo "🌐 Starting frontend server..."
npm run dev > frontend.log 2>&1 &

echo "⏳ Waiting for servers to start..."
sleep 10

echo "✅ Demo is ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://127.0.0.1:8000"
echo "🎯 Databricks Showcase: http://localhost:3000/databricks"
echo ""
echo "💡 Run 'python3 databricks_demo.py' for live API demo"
echo "🛑 Run './stop-demo.sh' to stop all servers"
