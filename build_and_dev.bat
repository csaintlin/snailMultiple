@echo off
echo Building the Vite project...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo.
    echo Build failed! Please check the output above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Build successful! Starting development server...
call npm run dev
pause
