"""Application configuration and constants."""
import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)

# Database
DATABASE_URL = f"sqlite:///{BASE_DIR / 'yatrilounge.db'}"

# CORS origins
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Staffing thresholds
STAFFING_RULES = [
    (0, 50, 2),
    (50, 100, 4),
    (100, 200, 6),
    (200, float("inf"), 8),
]

# Menu split
SNACK_RATIO = 0.60
BEVERAGE_RATIO = 0.40
BUFFER_STOCK_PERCENT = 0.10

# Model
MODEL_FILENAME = "crowd_predictor.pkl"
METRICS_FILENAME = "model_metrics.json"
