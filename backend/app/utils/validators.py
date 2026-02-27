"""CSV validation utilities."""
import pandas as pd
from fastapi import HTTPException

FLIGHT_REQUIRED_COLUMNS = {"arrival_time", "departure_time", "airline", "passenger_count"}
LOUNGE_REQUIRED_COLUMNS = {"timestamp", "entries_per_hour"}


def validate_flight_csv(df: pd.DataFrame) -> pd.DataFrame:
    """Validate and parse flight schedule CSV."""
    missing = FLIGHT_REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}"
        )

    df["arrival_time"] = pd.to_datetime(df["arrival_time"], errors="coerce")
    df["departure_time"] = pd.to_datetime(df["departure_time"], errors="coerce")
    df["passenger_count"] = pd.to_numeric(df["passenger_count"], errors="coerce")

    if df["arrival_time"].isna().any():
        raise HTTPException(status_code=400, detail="Invalid date format in arrival_time")
    if df["departure_time"].isna().any():
        raise HTTPException(status_code=400, detail="Invalid date format in departure_time")
    if df["passenger_count"].isna().any():
        raise HTTPException(status_code=400, detail="Invalid numbers in passenger_count")

    df["passenger_count"] = df["passenger_count"].astype(int)
    return df


def validate_lounge_csv(df: pd.DataFrame) -> pd.DataFrame:
    """Validate and parse lounge entry CSV."""
    missing = LOUNGE_REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}"
        )

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["entries_per_hour"] = pd.to_numeric(df["entries_per_hour"], errors="coerce")

    if df["timestamp"].isna().any():
        raise HTTPException(status_code=400, detail="Invalid date format in timestamp")
    if df["entries_per_hour"].isna().any():
        raise HTTPException(status_code=400, detail="Invalid numbers in entries_per_hour")

    df["entries_per_hour"] = df["entries_per_hour"].astype(int)
    return df
