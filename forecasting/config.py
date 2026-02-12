"""
Configuration for the blood demand forecasting module.
"""
import os
from dotenv import load_dotenv

# Load .env from project root (2 levels up from blood/forecasting)
# current: blood/forecasting/config.py
# root: .../Blood-Bank-Mern-Stack-Project-main/.env
current_dir = os.path.dirname(os.path.abspath(__file__))
# blood/forecasting -> blood -> project_root
project_root = os.path.dirname(os.path.dirname(current_dir))
blood_root = os.path.dirname(current_dir)

# Try loading from project root first, then blood directory
load_dotenv(os.path.join(project_root, '.env'))
load_dotenv(os.path.join(blood_root, '.env'))
# Also load standard search for good measure
load_dotenv()

# MongoDB Configuration
# Server uses MONGO_URL, so we check that too
MONGODB_URI = os.getenv('MONGODB_URI', os.getenv('MONGO_URL', 'mongodb://localhost:27017'))
MONGODB_DB = os.getenv('MONGODB_DB', 'test')

# Forecasting Configuration
FORECAST_DAYS = 7
# Allow very small samples so we can forecast with only a few recent records (e.g., last hours)
MIN_DATA_POINTS = 1
SEASONALITY_PERIOD = 7  # Weekly seasonality
CONFIDENCE_INTERVAL = 0.95

# Blood Groups
BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

# Logging Configuration
LOG_DIR = os.path.dirname(os.path.abspath(__file__)) + '/logs'
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# SARIMA Parameters (p, d, q) x (P, D, Q, s)
SARIMA_ORDER = (1, 1, 1)
SARIMA_SEASONAL_ORDER = (1, 1, 1, 7)

# Baseline Method Threshold
BASELINE_THRESHOLD = 1.5  # Use baseline if RMSE exceeds this
