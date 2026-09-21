#!/bin/bash

# GSFC Campus Connect Hub - Local Development Startup Script
# Starts both Frontend and Auth Server with no external APIs

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Campus Connect Hub - Local Development Environment           ║"
echo "║  Starting Frontend + Auth Server (No External APIs)           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server directory exists
if [ ! -d "server" ]; then
    echo -e "${RED}❌ Error: server directory not found${NC}"
    exit 1
fi

# Check if node_modules exist in server
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing auth server dependencies...${NC}"
    cd server
    npm install
    cd ..
fi

echo -e "${BLUE}🚀 Starting services...${NC}"
echo ""

# Start Auth Server
echo -e "${BLUE}▶️  Starting Auth Server (Port 5001)...${NC}"
cd server
npm run dev > /tmp/auth-server.log 2>&1 &
AUTH_SERVER_PID=$!
cd ..

sleep 2

# Check if auth server started
if ! ps -p $AUTH_SERVER_PID > /dev/null; then
    echo -e "${RED}❌ Failed to start auth server${NC}"
    cat /tmp/auth-server.log
    exit 1
fi

echo -e "${GREEN}✅ Auth Server started (PID: $AUTH_SERVER_PID)${NC}"

sleep 1

# Start Frontend
echo -e "${BLUE}▶️  Starting Frontend (Port 5173)...${NC}"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 2

# Check if frontend started
if ! ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${RED}❌ Failed to start frontend${NC}"
    kill $AUTH_SERVER_PID
    exit 1
fi

echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                 🎉 All Services Running                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Frontend:${NC}      http://localhost:5173"
echo -e "${BLUE}📍 Auth Server:${NC}   http://localhost:5001"
echo ""
echo -e "${YELLOW}📚 Demo Accounts:${NC}"
echo "   👤 Student:    student@gsfcuniversity.ac.in / Password@123"
echo "   👨‍💼 Admin:       admin.dean@gsfcuniversity.ac.in / AdminPass@123"
echo "   💼 Organizer:   placement@gsfcuniversity.ac.in / OrgPass@123"
echo ""
echo -e "${YELLOW}🛑 To stop services, press Ctrl+C${NC}"
echo ""

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $AUTH_SERVER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
