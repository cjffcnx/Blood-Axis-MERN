@echo off
REM Setup script for Blood Demand Forecasting Module on Windows

echo.
echo ================================================
echo Blood Demand Forecasting Module Setup ^(Windows^)
echo ================================================

REM Check Python installation
echo.
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed. Please install Python 3.7 or higher.
    exit /b 1
)
python --version

REM Install Python dependencies
echo.
echo [2/5] Installing Python dependencies...
cd forecasting
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    cd ..
    exit /b 1
)
cd ..

REM Check Node.js dependencies
echo.
echo [3/5] Checking Node.js dependencies...
findstr /M "node-cron" package.json >nul 2>&1
if errorlevel 1 (
    echo Installing node-cron...
    npm install node-cron
)

REM Create logs directory
echo.
echo [4/5] Creating logs directories...
if not exist forecasting\logs mkdir forecasting\logs
if not exist logs mkdir logs

REM Verify Python module
echo.
echo [5/5] Testing Python module import...
python -c "import sys; sys.path.insert(0, 'forecasting'); from forecast_engine import ForecastEngine; print('✓ Python module imports successfully')" 2>nul
if errorlevel 1 (
    echo ⚠ Warning: Could not import module. Ensure MongoDB is configured.
)

echo.
echo ================================================
echo Setup completed!
echo ================================================
echo.
echo Next steps:
echo 1. Ensure MongoDB is running
echo 2. Configure .env with MONGODB_URI and other settings
echo 3. Start the server: npm start
echo 4. Test the API: curl http://localhost:8080/api/v1/forecasting/forecast
echo.
echo Documentation: See forecasting/README.md
