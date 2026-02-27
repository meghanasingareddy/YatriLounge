"""Data ingestion API routes — CSV upload and validation."""
import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FlightSchedule, LoungeEntry
from app.schemas import UploadResponse
from app.utils.validators import validate_flight_csv, validate_lounge_csv

router = APIRouter(prefix="/api/upload", tags=["Data Ingestion"])


@router.post("/flights", response_model=UploadResponse)
async def upload_flight_schedule(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and validate a flight schedule CSV."""
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    df = validate_flight_csv(df)

    # Clear existing data
    db.query(FlightSchedule).delete()

    # Insert new records
    records = []
    for _, row in df.iterrows():
        records.append(FlightSchedule(
            arrival_time=row["arrival_time"],
            departure_time=row["departure_time"],
            airline=row["airline"],
            passenger_count=row["passenger_count"],
        ))

    db.bulk_save_objects(records)
    db.commit()

    return UploadResponse(
        message="Flight schedule uploaded successfully",
        rows_inserted=len(records),
        filename=file.filename or "unknown",
    )


@router.post("/lounge-entries", response_model=UploadResponse)
async def upload_lounge_entries(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and validate a lounge entry CSV."""
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    df = validate_lounge_csv(df)

    # Clear existing data
    db.query(LoungeEntry).delete()

    # Insert new records
    records = []
    for _, row in df.iterrows():
        records.append(LoungeEntry(
            timestamp=row["timestamp"],
            entries_per_hour=row["entries_per_hour"],
        ))

    db.bulk_save_objects(records)
    db.commit()

    return UploadResponse(
        message="Lounge entries uploaded successfully",
        rows_inserted=len(records),
        filename=file.filename or "unknown",
    )
