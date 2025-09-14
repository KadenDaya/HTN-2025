#!/bin/bash

# Social Finance App Startup Script
echo "🚀 Starting Social Finance App..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use"
        return 0
    else
        return 1
    fi
}

# Function to kill existing processes
cleanup() {
    echo "🧹 Cleaning up existing processes..."
    pkill -f "uvicorn.*main:app" 2>/dev/null || true
    pkill -f "next.*dev" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    sleep 2
}

# Cleanup existing processes
cleanup

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "api" ]; then
    echo "❌ Error: This script must be run from the project root directory"
    echo "   Make sure you're in the my-nextjs-app directory"
    exit 1
fi

# Check if Python dependencies are installed
echo "🐍 Checking Python dependencies..."
if ! python3 -c "import fastapi, uvicorn, databricks" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Check if Node dependencies are installed
echo "📦 Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start FastAPI backend
echo "🔧 Starting FastAPI backend on port 8000..."
cd api
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend started successfully
if ! check_port 8000; then
    echo "❌ Backend failed to start on port 8000"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Backend started successfully on http://localhost:8000"

# Start Next.js frontend
echo "🌐 Starting Next.js frontend on port 3000..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Check if frontend started successfully
if ! check_port 3000; then
    echo "❌ Frontend failed to start on port 3000"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Frontend started successfully on http://localhost:3000"

# Display status
echo ""
echo "🎉 Social Finance App is now running!"
echo ""
echo "📊 Frontend (Next.js):  http://localhost:3000"
echo "🔧 Backend (FastAPI):   http://localhost:8000"
echo "📚 API Docs:            http://localhost:8000/docs"
echo ""
echo "🔍 Available pages:"
echo "   • Homepage:          http://localhost:3000"
echo "   • Dashboard:         http://localhost:3000/dashboard"
echo "   • Investments:       http://localhost:3000/investments"
echo ""
echo "💡 To stop the app, press Ctrl+C"
echo ""

# Function to handle cleanup on exit
cleanup_on_exit() {
    echo ""
    echo "🛑 Shutting down Social Finance App..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ App stopped successfully"
    exit 0
}

# Set up signal handlers
trap cleanup_on_exit SIGINT SIGTERM

# Keep the script running and show logs
echo "📋 Showing application logs (Ctrl+C to stop):"
echo "----------------------------------------"

# Wait for processes to finish
wait
