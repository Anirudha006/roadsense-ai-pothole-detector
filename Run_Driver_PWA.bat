@echo off
title RoadSense AI - Driver PWA (Edge Inference)
cd /d "D:\projects\IEEE pothole\roadsense-ai"
echo =========================================================================
echo   RoadSense AI - Driver Edge PWA (Team 07)
echo   Starting Edge Inference PWA on http://localhost:5173
echo =========================================================================
echo.
start http://localhost:5173
call npm.cmd run dev:driver
pause
