@echo off
title SKAI Mess Management Launcher
echo ===================================================
echo Starting SKAI Hostel Mess Management System...
echo ===================================================

echo [1/3] Launching Python Flask Backend on http://localhost:5000 ...
start "SKAI Auth & Portal Backend (Port 5000)" cmd /k "cd /d %~dp0 && python app.py"

echo [2/3] Launching Inventory & Food Waste API on http://localhost:3000 ...
start "Shatakshi Inventory & Waste Server (Port 3000)" cmd /k "cd /d %~dp0 && node server.js"

echo [3/3] Launching Team React Frontend on http://localhost:5173 ...
start "SKAI Team Frontend (Port 5173)" cmd /k "cd /d %~dp0 && npm run dev --prefix frontend"

echo Opening browser...
timeout /t 3 >nul
start http://localhost:5173

echo ===================================================
echo Done! All servers are now active:
echo - Frontend:  http://localhost:5173
echo - Inventory: http://localhost:3000
echo - Backend:   http://localhost:5000
echo.
echo Login as Mess Manager:
echo Email:    shatakshisingh583@gmail.com
echo Password: Shatakshi123@
echo ===================================================
pause
