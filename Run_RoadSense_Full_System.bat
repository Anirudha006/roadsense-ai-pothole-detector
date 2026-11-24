@echo off
title RoadSense AI - Complete System Launcher (Team 07)
cd /d "D:\projects\IEEE pothole\roadsense-ai"
echo =========================================================================
echo   RoadSense AI - Complete Dual-Application Launcher (Team 07)
echo   1. Driver PWA (Edge AI on http://localhost:5173)
echo   2. Municipal GIS Dashboard (Analytics on http://localhost:5174)
echo =========================================================================
echo.
echo Launching Driver PWA...
start "RoadSense Driver PWA" cmd /k "cd /d D:\projects\IEEE pothole\roadsense-ai && npm.cmd run dev:driver"
timeout /t 3 >nul
start http://localhost:5173

echo Launching Municipal GIS Dashboard...
start "RoadSense Municipal Dashboard" cmd /k "cd /d D:\projects\IEEE pothole\roadsense-ai && npm.cmd run dev:dashboard"
timeout /t 3 >nul
start http://localhost:5174

echo.
echo Both applications are running!
echo - Driver PWA: http://localhost:5173
echo - Municipal Dashboard: http://localhost:5174
echo.
pause
