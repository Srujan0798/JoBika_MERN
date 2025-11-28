@echo off
echo ================================================
echo JoBika Platform - Complete Startup
echo ================================================
echo.
echo Starting JoBika with ALL features enabled:
echo - PDF/DOCX Parsing
echo - Job Scraping (Indeed, Naukri, LinkedIn)
echo - Enhanced AI Resume Enhancement
echo - Skill Recommendations
echo - Real Database
echo.
echo ================================================
echo.

echo [1/3] Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo.
echo [2/3] Installing/Updating dependencies...
cd backend
pip install -q -r requirements.txt
if errorlevel 1 (
    echo WARNING: Some dependencies may have failed
    echo Continuing anyway...
)

echo.
echo [3/3] Starting Enhanced Backend Server...
echo.
echo ================================================
echo JOBIKA IS READY!
echo ================================================
echo.
echo Backend API: http://localhost:5000
echo Frontend: Open app/index.html in browser
echo.
echo FEATURES ENABLED:
echo  [x] Real PDF/DOCX parsing
echo  [x] Job scraping from Indeed, Naukri
echo  [x] Enhanced AI resume improvement
echo  [x] Skill gap recommendations
echo  [x] Match score calculation
echo.
echo API ENDPOINTS:
echo  POST /api/auth/register - Register user
echo  POST /api/auth/login - Login
echo  POST /api/resume/upload - Upload resume (PDF/DOCX)
echo  GET  /api/jobs - Get jobs
echo  POST /api/jobs/scrape - Scrape fresh jobs
echo  GET  /api/resume/:id/recommendations - Get skill tips
echo  POST /api/applications - Apply to job
echo.
echo QUICK START:
echo  1. Open app/index.html in browser
echo  2. Register account
echo  3. Upload PDF/DOCX resume
echo  4. Browse jobs
echo  5. Apply with one click!
echo.
echo Press Ctrl+C to stop server
echo ================================================
echo.

python server.py
