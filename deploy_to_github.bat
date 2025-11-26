@echo off
echo ==========================================
echo      JoBika - Cloud Deployment Helper
echo ==========================================
echo.
echo This script will help you push your code to GitHub.
echo.
echo Prerequisite:
echo 1. Create a new repository on GitHub (https://github.com/new)
echo 2. Name it "JoBika" (or anything you like)
echo 3. Copy the HTTPS URL (e.g., https://github.com/YOUR_USER/JoBika.git)
echo.
pause

set REPO_URL=https://github.com/Srujan0798/JoBika.git

echo.
echo Configuring remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Renaming branch to main...
git branch -M main

echo.
echo Pushing to GitHub...
echo (You may be asked to sign in to GitHub in a browser window)
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ==========================================
    echo      SUCCESS! Deployment Triggered
    echo ==========================================
    echo.
    echo Your code is now on GitHub!
    echo.
    echo Next Steps:
    echo 1. Go to Railway (railway.app) or Render (render.com)
    echo 2. Create a new project from this GitHub repo
    echo 3. Add your Environment Variables
    echo.
) else (
    echo.
    echo [ERROR] Push failed. Please check your URL and try again.
)
pause
