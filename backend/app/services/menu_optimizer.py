"""Menu optimization engine."""
import math
from app.config import SNACK_RATIO, BEVERAGE_RATIO, BUFFER_STOCK_PERCENT


def calculate_menu_quantities(predictions: list) -> dict:
    """Calculate snack and beverage quantities with buffer stock."""
    hourly = []
    total_snacks = 0
    total_beverages = 0

    for pred in predictions:
        crowd = pred["predicted_crowd"]

        snack_base = math.ceil(crowd * SNACK_RATIO)
        bev_base = math.ceil(crowd * BEVERAGE_RATIO)

        snack_with_buffer = math.ceil(snack_base * (1 + BUFFER_STOCK_PERCENT))
        bev_with_buffer = math.ceil(bev_base * (1 + BUFFER_STOCK_PERCENT))

        hourly.append({
            "hour": pred["hour"],
            "predicted_crowd": crowd,
            "snack_units": snack_with_buffer,
            "beverage_units": bev_with_buffer,
        })

        total_snacks += snack_with_buffer
        total_beverages += bev_with_buffer

    return {
        "hourly": hourly,
        "total_snack_units": total_snacks,
        "total_beverage_units": total_beverages,
        "buffer_included": True,
    }
