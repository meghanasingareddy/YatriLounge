"""Recommendations API routes — staffing and menu."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import StaffingResponse, StaffingRow, MenuResponse, MenuHourly
from app.services.prediction_engine import forecast_next_6_hours
from app.services.staffing import generate_staffing_report
from app.services.menu_optimizer import calculate_menu_quantities

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/staffing", response_model=StaffingResponse)
async def get_staffing(db: Session = Depends(get_db)):
    """Get staffing recommendations for the next 6 hours."""
    try:
        predictions = forecast_next_6_hours(db)
        report = generate_staffing_report(predictions)
        return StaffingResponse(
            staffing=[StaffingRow(**s) for s in report["staffing"]],
            total_staff_needed=report["total_staff_needed"],
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/menu", response_model=MenuResponse)
async def get_menu(db: Session = Depends(get_db)):
    """Get menu optimization quantities for the next 6 hours."""
    try:
        predictions = forecast_next_6_hours(db)
        menu = calculate_menu_quantities(predictions)
        return MenuResponse(
            hourly=[MenuHourly(**m) for m in menu["hourly"]],
            total_snack_units=menu["total_snack_units"],
            total_beverage_units=menu["total_beverage_units"],
            buffer_included=menu["buffer_included"],
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
