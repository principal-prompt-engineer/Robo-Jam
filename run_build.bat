@echo off
rem One click: build dist\robo-jam.html from src\ (+ art\) and open it in your default browser.
rem Uses Node.js if installed (also checks the code), otherwise PowerShell (built into Windows).
cd /d "%~dp0"
echo Building Robo Jam...
echo.

where node >nul 2>nul
if %errorlevel%==0 (
  node tools\build.js
) else (
  echo Node.js not found, using PowerShell instead.
  powershell -NoProfile -ExecutionPolicy Bypass -File "tools\build.ps1"
)

if errorlevel 1 (
  echo.
  echo *** Build failed. Read the message above. ***
  pause
  exit /b 1
)

if not exist "dist\robo-jam.html" (
  echo.
  echo *** dist\robo-jam.html was not created. ***
  pause
  exit /b 1
)

echo.
echo Opening dist\robo-jam.html ...
start "" "dist\robo-jam.html"
timeout /t 3 >nul
