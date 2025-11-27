#!/bin/bash

# JoBika Backend - Quick Start Script
# This script helps you get started with the backend

echo "🚀 JoBika Backend Setup Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Please edit .env and add your configuration:${NC}"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - EMAIL_USER and EMAIL_PASSWORD"
    echo ""
    read -p "Press enter to continue after editing .env..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

echo ""
echo "🗄️  Checking MongoDB connection..."
# Start the server in test mode briefly
timeout 5 npm start > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo -e "${GREEN}✅ Server can start (MongoDB might be accessible)${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify MongoDB connection${NC}"
    echo "   Make sure MongoDB is running or update MONGODB_URI in .env"
fi

echo ""
echo "🧪 Running tests..."
npm test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed (this might be okay if MongoDB is not configured)${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start MongoDB (if running locally): mongod"
echo "2. Start the server: npm run dev"
echo "3. Test the API: curl http://localhost:5000/api/health"
echo ""
echo "For more information, see:"
echo "  - README.md - Quick start guide"
echo "  - TESTING.md - Testing guide"
echo "  - DEPLOYMENT.md - Deployment guide"
echo "  - FRONTEND_INTEGRATION.md - Frontend integration"
echo ""
