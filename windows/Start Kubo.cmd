@echo off
title Kubo's Classroom
cd /d "%~dp0"
if not exist "runtime\node.exe" (
  echo Please extract the entire ZIP folder first, then open Start Kubo again.
  pause
  exit /b 1
)
echo Opening Kubo's Classroom...
"%~dp0runtime\node.exe" "%~dp0windows\launcher.mjs"
if errorlevel 1 pause
