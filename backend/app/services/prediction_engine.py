"""ML prediction engine for crowd forecasting."""
import json
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sqlalchemy.orm import Session
from datetime import datetime

from app.config import MODELS_DIR, MODEL_FILENAME, METRICS_FILENAME
from app.services.feature_engineering import (
    build_feature_dataframe,
    build_forecast_features,
    FEATURE_COLUMNS,
)


def train_model(db: Session) -> dict:
    """Train the crowd prediction model and return metrics."""
    df = build_feature_dataframe(db)

    X = df[FEATURE_COLUMNS]
    y = df["entries_per_hour"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        min_samples_split=5,
        random_state=42,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))

    # Save model
    model_path = MODELS_DIR / MODEL_FILENAME
    joblib.dump(model, model_path)

    # Save metrics
    metrics = {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "features_used": FEATURE_COLUMNS,
        "trained_at": datetime.now().isoformat(),
    }
    metrics_path = MODELS_DIR / METRICS_FILENAME
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    return metrics


def load_model():
    """Load the trained model from disk."""
    model_path = MODELS_DIR / MODEL_FILENAME
    if not model_path.exists():
        raise FileNotFoundError("No trained model found. Please train the model first.")
    return joblib.load(model_path)


def load_metrics() -> dict:
    """Load saved model metrics."""
    metrics_path = MODELS_DIR / METRICS_FILENAME
    if not metrics_path.exists():
        raise FileNotFoundError("No metrics found. Please train the model first.")
    with open(metrics_path, "r") as f:
        return json.load(f)


def forecast_next_6_hours(db: Session, base_time: datetime = None, extra_flights: list = None) -> list:
    """Predict crowd levels for the next 6 hours."""
    model = load_model()
    forecast_df = build_forecast_features(db, base_time, extra_flights)

    X_forecast = forecast_df[FEATURE_COLUMNS]
    predictions = model.predict(X_forecast)

    results = []
    for i, pred in enumerate(predictions):
        pred_value = max(0, round(float(pred), 1))
        results.append({
            "hour": forecast_df.iloc[i]["target_hour"].strftime("%Y-%m-%d %H:%M"),
            "predicted_crowd": pred_value,
        })

    # Mark peak hour
    peak_idx = int(np.argmax([r["predicted_crowd"] for r in results]))
    for i, r in enumerate(results):
        r["is_peak"] = i == peak_idx

    return results
