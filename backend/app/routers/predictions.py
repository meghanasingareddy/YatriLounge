"""Prediction API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ForecastResponse, MetricsResponse, HourlyPrediction
from app.services.prediction_engine import train_model, forecast_next_6_hours, load_metrics

router = APIRouter(prefix="/api/predict", tags=["Predictions"])


@router.post("/train")
async def train(db: Session = Depends(get_db)):
    """Train the prediction model on ingested data."""
    try:
        metrics = train_model(db)
        return {
            "message": "Model trained successfully",
            "metrics": metrics,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.get("/forecast", response_model=ForecastResponse)
async def forecast(db: Session = Depends(get_db)):
    """Get next 6-hour crowd predictions."""
    try:
        results = forecast_next_6_hours(db)
        metrics = None
        try:
            metrics_data = load_metrics()
            metrics = metrics_data
        except FileNotFoundError:
            pass

        peak = max(results, key=lambda x: x["predicted_crowd"])
        return ForecastResponse(
            predictions=[HourlyPrediction(**r) for r in results],
            peak_hour=peak["hour"],
            peak_crowd=peak["predicted_crowd"],
            mae=metrics.get("mae") if metrics else None,
            rmse=metrics.get("rmse") if metrics else None,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {str(e)}")


@router.get("/metrics", response_model=MetricsResponse)
async def metrics():
    """Get model evaluation metrics."""
    try:
        data = load_metrics()
        return MetricsResponse(**data)
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
