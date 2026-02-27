"""Historical data analysis API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.historical_analysis import analyze_historical_data

router = APIRouter(prefix="/api/analysis", tags=["Historical Analysis"])


@router.get("/historical")
async def get_historical_analysis(db: Session = Depends(get_db)):
    """Get comprehensive historical data analysis."""
    try:
        analysis = analyze_historical_data(db)
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
