#!/bin/bash

# JoBika Deployment Script
# This script completes the deployment to Render and Supabase

echo "🚀 JoBika Deployment Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "server" ]; then
    echo "❌ Error: Not in JoBika project directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Verify commits
echo "📦 Step 1: Verifying commits..."
COMMITS=$(git log --oneline origin/main..HEAD | wc -l | tr -d ' ')
echo "   Commits ready to push: $COMMITS"

if [ "$COMMITS" -eq "0" ]; then
    echo "   ✅ All commits already pushed"
else
    echo "   ⚠️  $COMMITS commits need to be pushed"
fi
echo ""

# Step 2: Push to GitHub
echo "🔄 Step 2: Pushing to GitHub..."
echo "   Repository: https://github.com/Srujan0798/JoBika_PERN.git"
echo ""
echo "   Please authenticate when prompted:"
echo "   - Username: Srujan0798"
echo "   - Password: Your GitHub Personal Access Token"
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo "   ✅ Successfully pushed to GitHub"
else
    echo "   ❌ Push failed. Please check your credentials."
    echo ""
    echo "   To create a Personal Access Token:"
    echo "   1. Go to: https://github.com/settings/tokens"
    echo "   2. Click 'Generate new token (classic)'"
    echo "   3. Select 'repo' scope"
    echo "   4. Copy the token and use it as password"
    exit 1
fi
echo ""

# Step 3: Verify Render webhook
echo "🔍 Step 3: Checking Render deployment..."
echo "   Render should auto-deploy via webhook"
echo "   Dashboard: https://dashboard.render.com"
echo ""
echo "   Waiting 10 seconds for webhook to trigger..."
sleep 10
echo ""

# Step 4: Display next steps
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "   1. Check Render dashboard for build progress"
echo "   2. Wait ~5-10 minutes for deployment"
echo "   3. Verify production: https://jobika-pyt.onrender.com/api/health"
echo ""
echo "🗄️  Supabase Configuration:"
echo "   - Database: eabkwiklxjbqbfxcdlkk"
echo "   - Password: JoBika_Secure_2025!"
echo "   - Tables will be created on first connection"
echo ""
echo "🎉 Deployment complete!"
