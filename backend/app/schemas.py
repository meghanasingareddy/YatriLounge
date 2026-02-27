"""Pydantic schemas for API request/response validation."""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# --- Flight Schedules ---
class FlightScheduleOut(BaseModel):
    id: int
    arrival_time: datetime
    departure_time: datetime
    airline: str
    passenger_count: int

    class Config:
        from_attributes = True


# --- Lounge Entries ---
class LoungeEntryOut(BaseModel):
    id: int
    timestamp: datetime
    entries_per_hour: int

    class Config:
        from_attributes = True


# --- Predictions ---
class HourlyPrediction(BaseModel):
    hour: str
    predicted_crowd: float
    is_peak: bool = False


class ForecastResponse(BaseModel):
    predictions: List[HourlyPrediction]
    peak_hour: str
    peak_crowd: float
    mae: Optional[float] = None
    rmse: Optional[float] = None


# --- Staffing ---
class StaffingRow(BaseModel):
    hour: str
    predicted_crowd: float
    recommended_staff: int


class StaffingResponse(BaseModel):
    staffing: List[StaffingRow]
    total_staff_needed: int


# --- Menu ---
class MenuHourly(BaseModel):
    hour: str
    predicted_crowd: float
    snack_units: int
    beverage_units: int


class MenuResponse(BaseModel):
    hourly: List[MenuHourly]
    total_snack_units: int
    total_beverage_units: int
    buffer_included: bool = True


# --- Metrics ---
class MetricsResponse(BaseModel):
    mae: float
    rmse: float
    training_samples: int
    features_used: List[str]


# --- Simulation ---
class SimulationFlight(BaseModel):
    arrival_time: datetime
    departure_time: datetime
    airline: str
    passenger_count: int


class SimulationResponse(BaseModel):
    original_predictions: List[HourlyPrediction]
    simulated_predictions: List[HourlyPrediction]
    impact_summary: str


# --- Upload ---
class UploadResponse(BaseModel):
    message: str
    rows_inserted: int
    filename: str
