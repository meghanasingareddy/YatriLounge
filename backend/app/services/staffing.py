"""Staffing recommendation engine."""
from app.config import STAFFING_RULES


def get_recommended_staff(predicted_crowd: float) -> int:
    """Get recommended staff count based on predicted crowd."""
    for low, high, staff in STAFFING_RULES:
        if low <= predicted_crowd < high:
            return staff
    return STAFFING_RULES[-1][2]  # fallback to highest


def generate_staffing_report(predictions: list) -> dict:
    """Generate staffing recommendations for predicted hours."""
    staffing = []
    for pred in predictions:
        crowd = pred["predicted_crowd"]
        staff = get_recommended_staff(crowd)
        staffing.append({
            "hour": pred["hour"],
            "predicted_crowd": crowd,
            "recommended_staff": staff,
        })

    total_staff = max(row["recommended_staff"] for row in staffing)

    return {
        "staffing": staffing,
        "total_staff_needed": total_staff,
    }
