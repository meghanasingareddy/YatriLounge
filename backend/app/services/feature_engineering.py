"""Feature engineering pipeline for crowd prediction."""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models import FlightSchedule, LoungeEntry


def build_feature_dataframe(db: Session) -> pd.DataFrame:
    """Build a feature-rich dataframe from flight schedules and lounge entries."""
    # Load lounge entries
    lounge_entries = db.query(LoungeEntry).all()
    if not lounge_entries:
        raise ValueError("No lounge entry data found. Please upload lounge entry CSV first.")

    lounge_df = pd.DataFrame([{
        "timestamp": le.timestamp,
        "entries_per_hour": le.entries_per_hour,
    } for le in lounge_entries])

    lounge_df["timestamp"] = pd.to_datetime(lounge_df["timestamp"])
    lounge_df = lounge_df.sort_values("timestamp").reset_index(drop=True)

    # Load flight schedules
    flights = db.query(FlightSchedule).all()
    flight_df = pd.DataFrame([{
        "arrival_time": f.arrival_time,
        "passenger_count": f.passenger_count,
    } for f in flights]) if flights else pd.DataFrame(columns=["arrival_time", "passenger_count"])

    if not flight_df.empty:
        flight_df["arrival_time"] = pd.to_datetime(flight_df["arrival_time"])
        flight_df["arrival_hour"] = flight_df["arrival_time"].dt.floor("h")
        passengers_per_hour = flight_df.groupby("arrival_hour")["passenger_count"].sum().reset_index()
        passengers_per_hour.columns = ["timestamp", "total_expected_passengers"]
    else:
        passengers_per_hour = pd.DataFrame(columns=["timestamp", "total_expected_passengers"])

    # Merge on timestamp (hourly)
    lounge_df["timestamp_hour"] = lounge_df["timestamp"].dt.floor("h")
    if not passengers_per_hour.empty:
        merged = lounge_df.merge(
            passengers_per_hour,
            left_on="timestamp_hour",
            right_on="timestamp",
            how="left",
            suffixes=("", "_flight"),
        )
        merged["total_expected_passengers"] = merged["total_expected_passengers"].fillna(0)
        if "timestamp_flight" in merged.columns:
            merged = merged.drop(columns=["timestamp_flight"])
    else:
        merged = lounge_df.copy()
        merged["total_expected_passengers"] = 0

    # Extract time features
    merged["hour_of_day"] = merged["timestamp"].dt.hour
    merged["day_of_week"] = merged["timestamp"].dt.dayofweek
    merged["is_weekend"] = (merged["day_of_week"] >= 5).astype(int)

    # Rolling average of last 3 hours
    merged = merged.sort_values("timestamp").reset_index(drop=True)
    merged["rolling_avg_3h"] = (
        merged["entries_per_hour"]
        .rolling(window=3, min_periods=1)
        .mean()
        .shift(1)
        .fillna(0)
    )

    return merged


def build_forecast_features(db: Session, base_time: datetime = None, extra_flights: list = None) -> pd.DataFrame:
    """Build feature rows for the next 6 hours from base_time."""
    if base_time is None:
        base_time = datetime.now().replace(minute=0, second=0, microsecond=0)

    # Get recent lounge entries for rolling average
    lounge_entries = db.query(LoungeEntry).order_by(LoungeEntry.timestamp.desc()).limit(6).all()
    recent_entries = [le.entries_per_hour for le in lounge_entries][::-1]  # chronological

    # Get flight schedule data
    flights = db.query(FlightSchedule).all()
    flight_df = pd.DataFrame([{
        "arrival_time": f.arrival_time,
        "passenger_count": f.passenger_count,
    } for f in flights]) if flights else pd.DataFrame(columns=["arrival_time", "passenger_count"])

    # Add extra flights for simulation
    if extra_flights:
        extra_df = pd.DataFrame(extra_flights)
        if not extra_df.empty:
            flight_df = pd.concat([flight_df, extra_df], ignore_index=True)

    if not flight_df.empty:
        flight_df["arrival_time"] = pd.to_datetime(flight_df["arrival_time"])
        flight_df["arrival_hour"] = flight_df["arrival_time"].dt.floor("h")

    rows = []
    for i in range(6):
        target_hour = base_time + timedelta(hours=i + 1)

        # Passengers expected this hour
        if not flight_df.empty:
            mask = flight_df["arrival_hour"] == target_hour
            total_passengers = int(flight_df.loc[mask, "passenger_count"].sum())
        else:
            total_passengers = 0

        # Rolling average from recent data
        if len(recent_entries) >= 3:
            rolling_avg = np.mean(recent_entries[-3:])
        elif recent_entries:
            rolling_avg = np.mean(recent_entries)
        else:
            rolling_avg = 0

        rows.append({
            "hour_of_day": target_hour.hour,
            "day_of_week": target_hour.weekday(),
            "is_weekend": 1 if target_hour.weekday() >= 5 else 0,
            "rolling_avg_3h": rolling_avg,
            "total_expected_passengers": total_passengers,
            "target_hour": target_hour,
        })

    return pd.DataFrame(rows)


FEATURE_COLUMNS = [
    "hour_of_day",
    "day_of_week",
    "is_weekend",
    "rolling_avg_3h",
    "total_expected_passengers",
]
