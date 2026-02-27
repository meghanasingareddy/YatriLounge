"""Historical data analysis API routes."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.historical_analysis import analyze_historical_data

router = APIRouter(prefix="/api/analysis", tags=["Historical Analysis"])


@router.get("/historical")
async def get_historical_analysis(
    start_date: date = Query(None, description="Filter from this date (YYYY-MM-DD)"),
    end_date: date = Query(None, description="Filter up to this date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """Get comprehensive historical data analysis, optionally filtered by date range."""
    try:
        analysis = analyze_historical_data(db, start_date=start_date, end_date=end_date)
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
