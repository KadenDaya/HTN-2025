#!/bin/bash

# 🛑 Stop Demo Script - Clean shutdown of all services

echo "🛑 Stopping Databricks Demo..."

# Kill backend processes
echo "Stopping backend server..."
pkill -f "python.*main.py" 2>/dev/null || true

# Kill frontend processes  
echo "Stopping frontend server..."
pkill -f "next dev" 2>/dev/null || true

# Kill processes using our ports
echo "Freeing up ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clean up log files
echo "Cleaning up logs..."
rm -f backend.log frontend.log server.log 2>/dev/null || true

echo "✅ All demo services stopped"
echo "💡 Run './start-demo.sh' or './quick-start.sh' to restart"
