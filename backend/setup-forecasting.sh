#!/bin/bash
# Setup script for Blood Demand Forecasting Module

echo "================================================"
echo "Blood Demand Forecasting Module Setup"
echo "================================================"

# Check Python installation
echo -e "\n[1/5] Checking Python installation..."
if ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed. Please install Python 3.7 or higher."
    exit 1
fi
python --version

# Install Python dependencies
echo -e "\n[2/5] Installing Python dependencies..."
cd forecasting
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies"
    exit 1
fi
cd ..

# Check Node.js dependencies
echo -e "\n[3/5] Checking Node.js dependencies..."
if ! grep -q "node-cron" package.json; then
    echo "Installing node-cron..."
    npm install node-cron
fi

# Create logs directory
echo -e "\n[4/5] Creating logs directories..."
mkdir -p forecasting/logs
mkdir -p logs

# Verify MongoDB connection (optional)
echo -e "\n[5/5] Testing Python module import..."
python -c "
import sys
sys.path.insert(0, 'forecasting')
try:
    from forecast_engine import ForecastEngine
    print('✓ Python module imports successfully')
except Exception as e:
    print(f'⚠ Warning: {e}')
    print('Please ensure MongoDB is running and .env is configured')
"

echo -e "\n================================================"
echo "Setup completed!"
echo "================================================"
echo -e "\nNext steps:"
echo "1. Ensure MongoDB is running"
echo "2. Configure .env with MONGODB_URI and other settings"
echo "3. Start the server: npm start"
echo "4. Test the API: curl http://localhost:8080/api/v1/forecasting/forecast"
echo -e "\nDocumentation: See forecasting/README.md"
