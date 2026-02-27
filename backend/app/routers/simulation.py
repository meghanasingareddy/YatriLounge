"""Simulation and export API routes."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.database import get_db
from app.schemas import (
    SimulationFlight, SimulationResponse, HourlyPrediction,
)
from app.services.prediction_engine import forecast_next_6_hours, load_metrics
from app.services.staffing import generate_staffing_report
from app.services.menu_optimizer import calculate_menu_quantities
from app.services.pdf_export import generate_prediction_report

router = APIRouter(prefix="/api", tags=["Simulation & Export"])


@router.post("/simulate/add-flight", response_model=SimulationResponse)
async def simulate_add_flight(flight: SimulationFlight, db: Session = Depends(get_db)):
    """What-if simulation: add a hypothetical flight and see impact."""
    try:
        # Original predictions
        original = forecast_next_6_hours(db)

        # Simulated predictions with extra flight
        extra = [{
            "arrival_time": flight.arrival_time,
            "passenger_count": flight.passenger_count,
        }]
        simulated = forecast_next_6_hours(db, extra_flights=extra)

        # Impact summary
        orig_peak = max(p["predicted_crowd"] for p in original)
        sim_peak = max(p["predicted_crowd"] for p in simulated)
        diff = sim_peak - orig_peak

        impact = (
            f"Adding flight ({flight.airline}, {flight.passenger_count} pax) "
            f"{'increases' if diff > 0 else 'decreases'} peak crowd by "
            f"{abs(diff):.0f} people (from {orig_peak:.0f} to {sim_peak:.0f})."
        )

        return SimulationResponse(
            original_predictions=[HourlyPrediction(**p) for p in original],
            simulated_predictions=[HourlyPrediction(**p) for p in simulated],
            impact_summary=impact,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/pdf")
async def export_pdf(db: Session = Depends(get_db)):
    """Export prediction report as PDF."""
    try:
        predictions = forecast_next_6_hours(db)
        staffing = generate_staffing_report(predictions)
        menu = calculate_menu_quantities(predictions)

        try:
            metrics = load_metrics()
        except FileNotFoundError:
            metrics = None

        pdf_bytes = generate_prediction_report(predictions, staffing, menu, metrics)

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=yatrilounge_report.pdf"
            },
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
