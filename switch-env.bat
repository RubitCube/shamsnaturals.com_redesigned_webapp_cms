@echo off
REM Environment Switching Script for Shams Naturals (Windows)
REM Usage: switch-env.bat [test|prod]

if "%1"=="test" (
    echo Switching to TEST environment...
    
    REM Backend environment
    if exist "backend\.env.testserver" (
        copy /Y backend\.env.testserver backend\.env >nul
        echo [OK] Backend: Test environment activated
    ) else (
        echo [ERROR] backend\.env.testserver not found
        exit /b 1
    )
    
    REM Frontend environment
    if exist ".env.test" (
        copy /Y .env.test .env >nul
        echo [OK] Frontend: Test environment activated
    ) else (
        echo [ERROR] .env.test not found
        exit /b 1
    )
    
    echo.
    echo Test environment activated successfully!
    echo    - Backend: backend\.env
    echo    - Frontend: .env
    echo.
    echo Next steps:
    echo    1. cd backend ^&^& php artisan config:clear
    echo    2. cd ..\frontend ^&^& npm run build
    
) else if "%1"=="prod" (
    echo Switching to PRODUCTION environment...
    
    REM Backend environment
    if exist "backend\.env.productionserver" (
        copy /Y backend\.env.productionserver backend\.env >nul
        echo [OK] Backend: Production environment activated
    ) else (
        echo [ERROR] backend\.env.productionserver not found
        exit /b 1
    )
    
    REM Frontend environment
    if exist ".env.prod" (
        copy /Y .env.prod .env >nul
        echo [OK] Frontend: Production environment activated
    ) else (
        echo [ERROR] .env.prod not found
        exit /b 1
    )
    
    echo.
    echo Production environment activated successfully!
    echo    - Backend: backend\.env
    echo    - Frontend: .env
    echo.
    echo Next steps:
    echo    1. cd backend ^&^& php artisan config:cache
    echo    2. cd ..\frontend ^&^& npm run build
    
) else (
    echo Usage: switch-env.bat [test^|prod]
    echo.
    echo This script switches between test and production environments by:
    echo   - Copying backend\.env.testserver or backend\.env.productionserver to backend\.env
    echo   - Copying .env.test or .env.prod to .env (for frontend build)
    exit /b 1
)

