@echo off
title RoadSense AI - Municipal GIS Dashboard
cd /d "D:\projects\IEEE pothole\roadsense-ai"
echo =========================================================================
echo   RoadSense AI - Municipal GIS Dashboard (Team 07)
echo   Starting GIS Monitoring Dashboard on http://localhost:5174
echo =========================================================================
echo.
start http://localhost:5174
call npm.cmd run dev:dashboard
pause
