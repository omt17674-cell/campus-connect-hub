@echo off
REM GSFC Campus Connect Hub - Local Development Startup Script (Windows)
REM Starts both Frontend and Auth Server with no external APIs

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Campus Connect Hub - Local Development Environment           ║
echo ║  Starting Frontend + Auth Server (No External APIs)           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if server directory exists
if not exist "server" (
    echo Error: server directory not found
    exit /b 1
)

REM Check if node_modules exist in server
if not exist "server\node_modules" (
    echo Installing auth server dependencies...
    cd server
    call npm install
    cd ..
)

echo Starting services...
echo.

REM Start Auth Server
echo Starting Auth Server (Port 5001)...
cd server
start "Auth Server" npm run dev
cd ..

timeout /t 2 /nobreak

REM Start Frontend
echo Starting Frontend (Port 5173)...
start "Frontend" npm run dev

timeout /t 2 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                 All Services Running                           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Frontend:      http://localhost:5173
echo Auth Server:   http://localhost:5001
echo.
echo Demo Accounts:
echo    Student:    student@gsfcuniversity.ac.in / Password@123
echo    Admin:      admin.dean@gsfcuniversity.ac.in / AdminPass@123
echo    Organizer:  placement@gsfcuniversity.ac.in / OrgPass@123
echo.
echo Close this window to stop all services.
echo.
pause
