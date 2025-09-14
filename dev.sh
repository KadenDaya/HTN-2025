#!/bin/bash

# Quick Development Startup Script
echo "🚀 Quick Start - Social Finance App"

# Kill existing processes
pkill -f "uvicorn.*main:app" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true
sleep 1

# Start backend in background
echo "🔧 Starting backend..."
cd api && python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
cd ..

# Start frontend
echo "🌐 Starting frontend..."
npm run dev

# Note: Frontend will keep running in foreground, backend in background
# Press Ctrl+C to stop frontend, then run: pkill -f "uvicorn.*main:app" to stop backend
