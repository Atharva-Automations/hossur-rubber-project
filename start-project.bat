@echo off
echo Starting Full Stack Project...

:: Start Backend
echo Starting Backend...
start cmd /k "cd api && npm run start:dev"

:: Wait a bit so backend initializes
timeout /t 5 > nul

:: Start Frontend on port 3001
echo Starting Frontend...
start cmd /k "cd web && npm run dev -- -p 3001"

:: Wait before opening browser
timeout /t 5 > nul

:: Open browser
echo Opening browser...
start http://localhost:3001

echo Done!