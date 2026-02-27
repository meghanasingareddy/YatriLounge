"""SQLAlchemy ORM models."""
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from app.database import Base


class FlightSchedule(Base):
    __tablename__ = "flight_schedules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    arrival_time = Column(DateTime, nullable=False)
    departure_time = Column(DateTime, nullable=False)
    airline = Column(String(100), nullable=False)
    passenger_count = Column(Integer, nullable=False)


class LoungeEntry(Base):
    __tablename__ = "lounge_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, nullable=False)
    entries_per_hour = Column(Integer, nullable=False)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    predicted_at = Column(DateTime, nullable=False)
    target_hour = Column(DateTime, nullable=False)
    predicted_crowd = Column(Float, nullable=False)
    recommended_staff = Column(Integer, nullable=False)
    snack_units = Column(Integer, nullable=False)
    beverage_units = Column(Integer, nullable=False)
