"""Historical data analysis service."""
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models import FlightSchedule, LoungeEntry


def analyze_historical_data(db: Session) -> dict:
    """Perform comprehensive historical analysis on uploaded data."""
    # Load lounge entries
    lounge_entries = db.query(LoungeEntry).all()
    if not lounge_entries:
        raise ValueError("No lounge entry data found.")

    lounge_df = pd.DataFrame([{
        "timestamp": le.timestamp,
        "entries_per_hour": le.entries_per_hour,
    } for le in lounge_entries])
    lounge_df["timestamp"] = pd.to_datetime(lounge_df["timestamp"])
    lounge_df["hour"] = lounge_df["timestamp"].dt.hour
    lounge_df["day_of_week"] = lounge_df["timestamp"].dt.dayofweek
    lounge_df["day_name"] = lounge_df["timestamp"].dt.day_name()
    lounge_df["date"] = lounge_df["timestamp"].dt.date
    lounge_df["is_weekend"] = lounge_df["day_of_week"] >= 5

    # Load flights
    flights = db.query(FlightSchedule).all()
    flight_df = pd.DataFrame([{
        "arrival_time": f.arrival_time,
        "departure_time": f.departure_time,
        "airline": f.airline,
        "passenger_count": f.passenger_count,
    } for f in flights]) if flights else pd.DataFrame()

    if not flight_df.empty:
        flight_df["arrival_time"] = pd.to_datetime(flight_df["arrival_time"])
        flight_df["hour"] = flight_df["arrival_time"].dt.hour
        flight_df["date"] = flight_df["arrival_time"].dt.date

    # --- Analysis Results ---

    # 1. Hourly average pattern (which hours are busiest on average)
    hourly_avg = lounge_df.groupby("hour")["entries_per_hour"].mean().round(1)
    hourly_pattern = [
        {"hour": int(h), "avg_entries": float(v)}
        for h, v in hourly_avg.items()
    ]

    # 2. Daily pattern (which days of the week are busiest)
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    daily_avg = lounge_df.groupby("day_name")["entries_per_hour"].mean().round(1)
    daily_pattern = [
        {"day": d, "avg_entries": float(daily_avg.get(d, 0))}
        for d in day_order
    ]

    # 3. Weekend vs Weekday comparison
    weekend_avg = float(lounge_df[lounge_df["is_weekend"]]["entries_per_hour"].mean()) if lounge_df["is_weekend"].any() else 0
    weekday_avg = float(lounge_df[~lounge_df["is_weekend"]]["entries_per_hour"].mean())

    # 4. Peak hours (top 5 busiest hours overall)
    top_hours = lounge_df.nlargest(5, "entries_per_hour")[["timestamp", "entries_per_hour"]]
    peak_records = [
        {"timestamp": row["timestamp"].strftime("%Y-%m-%d %H:%M"), "entries": int(row["entries_per_hour"])}
        for _, row in top_hours.iterrows()
    ]

    # 5. Daily total trend
    daily_totals = lounge_df.groupby("date")["entries_per_hour"].sum().reset_index()
    daily_totals["date"] = daily_totals["date"].astype(str)
    daily_trend = [
        {"date": row["date"], "total_entries": int(row["entries_per_hour"])}
        for _, row in daily_totals.iterrows()
    ]

    # 6. Airline distribution (flights)
    airline_stats = []
    if not flight_df.empty:
        airline_counts = flight_df.groupby("airline").agg(
            flights=("airline", "count"),
            avg_passengers=("passenger_count", "mean"),
            total_passengers=("passenger_count", "sum"),
        ).reset_index()
        airline_counts["avg_passengers"] = airline_counts["avg_passengers"].round(0).astype(int)
        airline_stats = [
            {
                "airline": row["airline"],
                "flights": int(row["flights"]),
                "avg_passengers": int(row["avg_passengers"]),
                "total_passengers": int(row["total_passengers"]),
            }
            for _, row in airline_counts.sort_values("flights", ascending=False).iterrows()
        ]

    # 7. Summary statistics
    summary = {
        "total_days": int(lounge_df["date"].nunique()),
        "total_lounge_entries": int(lounge_df["entries_per_hour"].sum()),
        "avg_entries_per_hour": round(float(lounge_df["entries_per_hour"].mean()), 1),
        "max_entries_in_hour": int(lounge_df["entries_per_hour"].max()),
        "busiest_hour": int(hourly_avg.idxmax()),
        "quietest_hour": int(hourly_avg.idxmin()),
        "weekend_avg": round(weekend_avg, 1),
        "weekday_avg": round(weekday_avg, 1),
        "total_flights": len(flight_df) if not flight_df.empty else 0,
        "total_passengers": int(flight_df["passenger_count"].sum()) if not flight_df.empty else 0,
        "airlines_count": int(flight_df["airline"].nunique()) if not flight_df.empty else 0,
    }

    return {
        "summary": summary,
        "hourly_pattern": hourly_pattern,
        "daily_pattern": daily_pattern,
        "peak_records": peak_records,
        "daily_trend": daily_trend,
        "airline_stats": airline_stats,
    }
