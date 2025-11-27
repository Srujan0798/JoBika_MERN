#!/bin/bash

# JoBika Backend - Test Runner
# Runs all tests and shows results

echo "🧪 Running JoBika Test Suite..."
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
    echo ""
fi

# Run tests
npm test

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo ""
else
    echo ""
    echo "❌ Some tests failed. Check output above."
    echo ""
    exit 1
fi
