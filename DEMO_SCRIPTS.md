# 🚀 Demo Scripts Guide

## Quick Commands

### 🎯 **For Event Presentations (Recommended)**
```bash
./start-demo.sh
```
**Full-featured startup with dependency checks, testing, and monitoring**

### ⚡ **For Quick Testing**
```bash
./quick-start.sh
```
**Fast startup without extra checks - gets you running in 10 seconds**

### 🛑 **To Stop Everything**
```bash
./stop-demo.sh
```
**Clean shutdown of all services and cleanup**

---

## Script Details

### 🎪 `start-demo.sh` - Full Event Demo
**Perfect for presentations and events**

**Features:**
- ✅ Dependency verification (Python, Node.js, npm)
- ✅ Automatic dependency installation
- ✅ Database initialization
- ✅ Backend server startup (port 8000)
- ✅ Frontend server startup (port 3000)
- ✅ API endpoint testing
- ✅ Live log monitoring
- ✅ Comprehensive demo information
- ✅ Process management and cleanup

**Usage:**
```bash
./start-demo.sh
```

**What it shows:**
- 🌐 All available URLs
- 🔗 API endpoints for testing
- 📊 Key features to showcase
- 🎯 Presentation flow guide
- 💡 Pro tips for demos

---

### ⚡ `quick-start.sh` - Fast Startup
**For development and quick testing**

**Features:**
- 🚀 Minimal setup time (~10 seconds)
- 🗄️ Database initialization
- 🖥️ Backend server startup
- 🌐 Frontend server startup
- 📋 Essential URLs displayed

**Usage:**
```bash
./quick-start.sh
```

**Perfect when:**
- You need to test something quickly
- You're developing and restarting frequently
- You don't need full monitoring

---

### 🛑 `stop-demo.sh` - Clean Shutdown
**Stops all services and cleans up**

**Features:**
- 🔌 Stops backend server
- 🌐 Stops frontend server
- 🧹 Frees up ports (3000, 8000)
- 📝 Cleans up log files
- ✅ Confirms shutdown

**Usage:**
```bash
./stop-demo.sh
```

---

### 🧪 `databricks_demo.py` - Live API Demo
**Interactive demo script for presentations**

**Features:**
- 📊 Tests all API endpoints
- 🔄 Shows data sync capabilities
- 📈 Demonstrates analytics
- 🎯 Event-ready presentation flow

**Usage:**
```bash
python3 databricks_demo.py
```

---

## Demo URLs

### 🌐 Frontend (Next.js)
- **Main App**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Databricks Showcase**: http://localhost:3000/databricks ⭐
- **Investments**: http://localhost:3000/investments
- **Trends**: http://localhost:3000/trends

### 🔗 Backend API (FastAPI)
- **API Documentation**: http://127.0.0.1:8000/docs
- **Database Test**: http://127.0.0.1:8000/test-database
- **Dashboard Data**: http://127.0.0.1:8000/api/v1/dashboard
- **Databricks Showcase**: http://127.0.0.1:8000/api/v1/databricks/showcase ⭐
- **Data Sync**: http://127.0.0.1:8000/api/v1/databricks/sync
- **Advanced Analytics**: http://127.0.0.1:8000/api/v1/databricks/analytics

---

## Event Presentation Flow

### 1. **Setup** (Before presentation)
```bash
./start-demo.sh
```

### 2. **Opening** (Show the problem)
- Navigate to http://localhost:3000
- Explain financial data complexity

### 3. **Solution** (Hybrid architecture)
- Go to http://localhost:3000/databricks
- Show system status and capabilities

### 4. **Live Demo** (The wow factor)
```bash
# In a separate terminal
python3 databricks_demo.py
```

### 5. **Interactive Features**
- Data sync functionality
- Advanced analytics
- Real-time visualizations

### 6. **Closing** (Databricks benefits)
- Highlight Delta Lake, ML capabilities
- Show advanced SQL queries
- Emphasize event sponsor integration

---

## Troubleshooting

### Port Already in Use
```bash
./stop-demo.sh
./start-demo.sh
```

### Dependencies Missing
```bash
# Install Python dependencies
pip3 install -r requirements.txt

# Install Node.js dependencies  
npm install
```

### Database Issues
```bash
# Reinitialize database
python3 api/sqlite_db.py
```

### Frontend Won't Load
```bash
# Check if Next.js is running
curl http://localhost:3000

# Restart if needed
./stop-demo.sh
./quick-start.sh
```

### Backend API Errors
```bash
# Check backend status
curl http://127.0.0.1:8000/test-database

# View logs
tail -f backend.log
```

---

## Pro Tips for Events

### 🎯 **Before Your Presentation**
1. Run `./start-demo.sh` 10 minutes early
2. Test all URLs work
3. Upload a sample PDF to populate data
4. Practice the `databricks_demo.py` script

### 🎪 **During Your Presentation**
1. Keep the startup terminal open for monitoring
2. Use a separate terminal for `databricks_demo.py`
3. Have backup URLs ready in case of network issues
4. Emphasize the hybrid architecture benefits

### 🚀 **Key Talking Points**
- "Hybrid SQLite + Databricks architecture"
- "Real-time data synchronization"
- "Advanced SQL with window functions"
- "Delta Lake for data reliability"
- "ML-ready data transformations"

---

## File Structure
```
📁 Demo Scripts
├── 🚀 start-demo.sh      # Full event demo startup
├── ⚡ quick-start.sh     # Fast development startup  
├── 🛑 stop-demo.sh       # Clean shutdown
├── 🧪 databricks_demo.py # Live API demonstration
├── 📋 DEMO_SCRIPTS.md    # This guide
└── 📊 DATABRICKS_SHOWCASE.md # Detailed showcase info
```

---

## 🎉 You're Event Ready!

Your Databricks showcase is now fully automated and ready for any presentation. Just run `./start-demo.sh` and impress your audience! 🎯
