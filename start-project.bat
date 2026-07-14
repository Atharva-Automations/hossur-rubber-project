@echo off
echo Starting Full Stack Project...

:: Start Backend
echo Starting Backend...
start cmd /k "cd api && npm run start:dev"

:: Wait a bit so backend initializes
timeout /t 5 > nul

:: Start PLC Service (from root folder)
echo Starting PLC Service...
start cmd /k "npx nx serve plc-service"

:: Wait a bit
timeout /t 3 > nul

:: Start Frontend on port 3001
echo Starting Frontend...
start cmd /k "cd web && npm run dev -- -p 3001"

:: Wait a bit
timeout /t 3 > nul

:: Start Prisma Studio
echo Starting Prisma Studio...
start cmd /k "cd api && npx prisma studio"

:: Wait before opening browser
timeout /t 5 > nul

:: Open browser
echo Opening browser...
start http://localhost:3001

echo All services started!