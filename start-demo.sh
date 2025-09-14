#!/bin/bash

# 🚀 Databricks Event Demo Startup Script
# This script starts everything you need for your presentation!

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

# Cleanup function
cleanup() {
    print_header "🧹 CLEANING UP PROCESSES"
    
    # Kill any existing processes
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    print_success "Cleanup complete"
    sleep 2
}

# Check dependencies
check_dependencies() {
    print_header "🔍 CHECKING DEPENDENCIES"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 is not installed"
        exit 1
    fi
    print_success "Python3 found: $(python3 --version)"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm found: $(npm --version)"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "api/main.py" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    print_success "Project structure verified"
}

# Install dependencies
install_dependencies() {
    print_header "📦 INSTALLING DEPENDENCIES"
    
    # Install Python dependencies
    print_status "Installing Python dependencies..."
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt --user --quiet
        print_success "Python dependencies installed"
    else
        print_warning "No requirements.txt found, skipping Python dependencies"
    fi
    
    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    npm install --silent
    print_success "Node.js dependencies installed"
}

# Initialize database
init_database() {
    print_header "🗄️ INITIALIZING DATABASE"
    
    print_status "Setting up SQLite database..."
    python3 api/sqlite_db.py
    print_success "Database initialized successfully"
}

# Start backend server
start_backend() {
    print_header "🖥️ STARTING BACKEND SERVER"
    
    print_status "Starting FastAPI server on port 8000..."
    python3 api/main.py > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_status "Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -s http://127.0.0.1:8000/test-database > /dev/null 2>&1; then
            print_success "Backend server is running (PID: $BACKEND_PID)"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    print_error "Backend server failed to start"
    exit 1
}

# Start frontend server
start_frontend() {
    print_header "🌐 STARTING FRONTEND SERVER"
    
    print_status "Starting Next.js development server on port 3000..."
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to be ready..."
    for i in {1..60}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend server is running (PID: $FRONTEND_PID)"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    
    print_error "Frontend server failed to start"
    exit 1
}

# Test API endpoints
test_endpoints() {
    print_header "🧪 TESTING API ENDPOINTS"
    
    # Test database connection
    print_status "Testing database connection..."
    if curl -s http://127.0.0.1:8000/test-database | grep -q "success"; then
        print_success "Database connection: OK"
    else
        print_warning "Database connection: Failed"
    fi
    
    # Test dashboard endpoint
    print_status "Testing dashboard endpoint..."
    if curl -s http://127.0.0.1:8000/api/v1/dashboard > /dev/null; then
        print_success "Dashboard endpoint: OK"
    else
        print_warning "Dashboard endpoint: Failed"
    fi
    
    # Test Databricks showcase
    print_status "Testing Databricks showcase..."
    if curl -s http://127.0.0.1:8000/api/v1/databricks/showcase > /dev/null; then
        print_success "Databricks showcase: OK"
    else
        print_warning "Databricks showcase: Failed"
    fi
}

# Display demo information
show_demo_info() {
    print_header "🎯 DEMO READY - PRESENTATION INFORMATION"
    
    echo -e "${CYAN}🌐 Frontend (Next.js):${NC}"
    echo -e "   • Main App: ${GREEN}http://localhost:3000${NC}"
    echo -e "   • Dashboard: ${GREEN}http://localhost:3000/dashboard${NC}"
    echo -e "   • Databricks Showcase: ${GREEN}http://localhost:3000/databricks${NC}"
    echo -e "   • Investments: ${GREEN}http://localhost:3000/investments${NC}"
    echo -e "   • Trends: ${GREEN}http://localhost:3000/trends${NC}"
    echo ""
    
    echo -e "${CYAN}🔗 Backend API (FastAPI):${NC}"
    echo -e "   • API Docs: ${GREEN}http://127.0.0.1:8000/docs${NC}"
    echo -e "   • Database Test: ${GREEN}http://127.0.0.1:8000/test-database${NC}"
    echo -e "   • Dashboard Data: ${GREEN}http://127.0.0.1:8000/api/v1/dashboard${NC}"
    echo -e "   • Databricks Showcase: ${GREEN}http://127.0.0.1:8000/api/v1/databricks/showcase${NC}"
    echo ""
    
    echo -e "${CYAN}🎪 Demo Scripts:${NC}"
    echo -e "   • Run live demo: ${GREEN}python3 databricks_demo.py${NC}"
    echo -e "   • Upload test file: ${GREEN}curl -X POST -F 'file=@data/test.pdf' http://127.0.0.1:8000/upload${NC}"
    echo ""
    
    echo -e "${CYAN}📊 Key Features to Showcase:${NC}"
    echo -e "   • ✅ Hybrid SQLite + Databricks architecture"
    echo -e "   • ✅ Real-time data synchronization"
    echo -e "   • ✅ Advanced SQL analytics with window functions"
    echo -e "   • ✅ Interactive dashboard and visualizations"
    echo -e "   • ✅ ML-ready data transformations"
    echo -e "   • ✅ Delta Lake integration"
    echo ""
    
    echo -e "${CYAN}🎯 Presentation Flow:${NC}"
    echo -e "   1. Show main app at ${GREEN}localhost:3000${NC}"
    echo -e "   2. Navigate to Databricks showcase"
    echo -e "   3. Demonstrate data sync functionality"
    echo -e "   4. Run advanced analytics"
    echo -e "   5. Show dashboard with real data"
    echo ""
    
    echo -e "${YELLOW}💡 Pro Tips:${NC}"
    echo -e "   • Keep this terminal open to monitor logs"
    echo -e "   • Use ${GREEN}python3 databricks_demo.py${NC} for live API demos"
    echo -e "   • Upload PDF files to populate database"
    echo -e "   • Logs are saved to backend.log and frontend.log"
    echo ""
    
    print_success "🎉 Everything is ready for your Databricks event presentation!"
}

# Main execution
main() {
    print_header "🚀 DATABRICKS EVENT DEMO STARTUP"
    echo -e "${CYAN}Starting your event-ready demo environment...${NC}"
    echo ""
    
    # Run all setup steps
    cleanup
    check_dependencies
    install_dependencies
    init_database
    start_backend
    start_frontend
    sleep 3  # Give servers time to fully start
    test_endpoints
    show_demo_info
    
    # Keep script running and show logs
    print_header "📋 MONITORING LOGS (Press Ctrl+C to stop)"
    echo -e "${YELLOW}Tip: Open a new terminal to run demo commands${NC}"
    echo ""
    
    # Monitor both logs
    tail -f backend.log frontend.log 2>/dev/null || {
        print_status "Servers are running in background"
        print_status "Check backend.log and frontend.log for detailed logs"
        
        # Keep script alive
        while true; do
            sleep 10
            if ! kill -0 $BACKEND_PID 2>/dev/null; then
                print_error "Backend server stopped unexpectedly"
                break
            fi
            if ! kill -0 $FRONTEND_PID 2>/dev/null; then
                print_error "Frontend server stopped unexpectedly"
                break
            fi
        done
    }
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}Shutting down demo environment...${NC}"; cleanup; exit 0' INT

# Run main function
main "$@"
