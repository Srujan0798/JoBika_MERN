@echo off
echo ==========================================
echo JoBika MERN Stack Setup Script
echo ==========================================

echo.
echo 1. Checking Node.js...
node -v
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed! Please install it from nodejs.org
    pause
    exit /b
)

echo.
echo 2. Setting up Backend...
cd server
echo Installing backend dependencies...
call npm install
cd ..

echo.
echo 3. Setting up Frontend...
if not exist "client" (
    echo Creating React app...
    call npm create vite@latest client -- --template react
    cd client
    echo Installing frontend dependencies...
    call npm install
    call npm install axios react-router-dom tailwindcss postcss autoprefixer
    call npx tailwindcss init -p
    cd ..
) else (
    echo Client folder already exists. Skipping creation.
)

echo.
echo ==========================================
echo Setup Complete!
echo.
echo To start the backend:
echo   cd server
echo   npm start
echo.
echo To start the frontend:
echo   cd client
echo   npm run dev
echo ==========================================
pause
