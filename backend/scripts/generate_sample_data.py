"""
Sample data generator for YatriLounge.
Generates realistic flight schedule and lounge entry CSVs for 30 days.
"""
import os
import sys
import random
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd

# Add parent to path so we can import config
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.config import DATA_DIR

AIRLINES = [
    "Air India", "IndiGo", "SpiceJet", "Vistara",
    "GoAir", "AirAsia India", "Emirates", "Singapore Airlines",
    "Lufthansa", "British Airways"
]

DAYS = 30
SEED = 42


def generate_flight_schedule(days: int = DAYS) -> pd.DataFrame:
    """Generate realistic flight schedule data."""
    random.seed(SEED)
    np.random.seed(SEED)

    records = []
    base_date = datetime(2026, 2, 1)

    for day in range(days):
        current_date = base_date + timedelta(days=day)
        is_weekend = current_date.weekday() >= 5

        # More flights on weekends / peak hours
        flights_per_day = random.randint(30, 50) if is_weekend else random.randint(20, 40)

        for _ in range(flights_per_day):
            # Peak hours: 6-10 AM and 5-9 PM
            hour_weights = [
                0.5, 0.3, 0.2, 0.2, 0.3, 0.8,  # 0-5
                2.0, 3.0, 3.5, 3.0, 2.0, 1.5,    # 6-11
                1.2, 1.0, 1.2, 1.5, 2.0, 3.0,    # 12-17
                3.5, 3.0, 2.5, 2.0, 1.5, 1.0     # 18-23
            ]
            hour = random.choices(range(24), weights=hour_weights, k=1)[0]
            minute = random.randint(0, 59)

            arrival_time = current_date.replace(hour=hour, minute=minute)
            # Departure is 1-3 hours after arrival
            departure_time = arrival_time + timedelta(hours=random.uniform(1, 3))

            airline = random.choice(AIRLINES)
            passenger_count = int(np.random.normal(150, 50))
            passenger_count = max(30, min(350, passenger_count))

            records.append({
                "arrival_time": arrival_time.strftime("%Y-%m-%d %H:%M:%S"),
                "departure_time": departure_time.strftime("%Y-%m-%d %H:%M:%S"),
                "airline": airline,
                "passenger_count": passenger_count,
            })

    df = pd.DataFrame(records)
    return df


def generate_lounge_entries(flight_df: pd.DataFrame, days: int = DAYS) -> pd.DataFrame:
    """Generate lounge entry data correlated with flight schedules."""
    random.seed(SEED + 1)
    np.random.seed(SEED + 1)

    base_date = datetime(2026, 2, 1)
    records = []

    flight_df_parsed = flight_df.copy()
    flight_df_parsed["arrival_time"] = pd.to_datetime(flight_df_parsed["arrival_time"])

    for day in range(days):
        current_date = base_date + timedelta(days=day)

        for hour in range(24):
            ts = current_date.replace(hour=hour, minute=0, second=0)

            # Count passengers arriving in this hour
            mask = (
                (flight_df_parsed["arrival_time"].dt.date == current_date.date()) &
                (flight_df_parsed["arrival_time"].dt.hour == hour)
            )
            arrivals = flight_df_parsed.loc[mask, "passenger_count"].sum()

            # ~15-25% of arriving passengers use the lounge
            lounge_rate = random.uniform(0.15, 0.25)
            base_entries = int(arrivals * lounge_rate)

            # Add some random noise
            noise = int(np.random.normal(0, max(5, base_entries * 0.1)))
            entries = max(0, base_entries + noise)

            records.append({
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "entries_per_hour": entries,
            })

    df = pd.DataFrame(records)
    return df


def main():
    """Generate and save sample datasets."""
    print("🛫 Generating sample flight schedule data...")
    flight_df = generate_flight_schedule()
    flight_path = DATA_DIR / "flight_schedule.csv"
    flight_df.to_csv(flight_path, index=False)
    print(f"   ✅ Saved {len(flight_df)} flights to {flight_path}")

    print("🏢 Generating sample lounge entry data...")
    lounge_df = generate_lounge_entries(flight_df)
    lounge_path = DATA_DIR / "lounge_entries.csv"
    lounge_df.to_csv(lounge_path, index=False)
    print(f"   ✅ Saved {len(lounge_df)} entries to {lounge_path}")

    print("\n📊 Flight data summary:")
    print(f"   Date range: {flight_df['arrival_time'].min()} → {flight_df['arrival_time'].max()}")
    print(f"   Airlines: {flight_df['airline'].nunique()}")
    print(f"   Avg passengers/flight: {flight_df['passenger_count'].mean():.0f}")

    print("\n📊 Lounge data summary:")
    ld = pd.to_numeric(lounge_df["entries_per_hour"])
    print(f"   Total hours: {len(lounge_df)}")
    print(f"   Avg entries/hour: {ld.mean():.1f}")
    print(f"   Peak entries/hour: {ld.max()}")

    print("\n🎉 Sample data generation complete!")


if __name__ == "__main__":
    main()
