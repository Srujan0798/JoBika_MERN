#!/bin/bash

# JoBika Backend - Development Server Runner
# Automatically restarts on file changes

echo "🚀 Starting JoBika Development Server..."
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ .env created. Please update with your configuration."
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start development server
echo "🔄 Starting server with nodemon (auto-reload enabled)..."
echo "📡 Server will be available at: http://localhost:5000"
echo "📚 API Documentation: http://localhost:5000/api-docs"
echo "💚 Health Check: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop"
echo "========================================" 
echo ""

npm run dev
