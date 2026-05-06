"""
Demand forecasting logic using simple moving average and weighted moving average.
"""
from typing import List
import numpy as np


def moving_average(historical: List[float], periods: int = 3) -> float:
    """Simple moving average over the last `periods` values."""
    data = historical[-periods:] if len(historical) >= periods else historical
    return float(np.mean(data)) if data else 0.0


def weighted_moving_average(historical: List[float], periods: int = 3) -> float:
    """Weighted moving average – more recent values have higher weight."""
    data = historical[-periods:] if len(historical) >= periods else historical
    n = len(data)
    if n == 0:
        return 0.0
    weights = list(range(1, n + 1))
    total_weight = sum(weights)
    return float(sum(w * v for w, v in zip(weights, data)) / total_weight)


def exponential_smoothing(historical: List[float], alpha: float = 0.3) -> float:
    """Single exponential smoothing forecast for the next period."""
    if not historical:
        return 0.0
    forecast = historical[0]
    for actual in historical[1:]:
        forecast = alpha * actual + (1 - alpha) * forecast
    return float(forecast)


def generate_forecast(historical: List[float], periods: int = 4, method: str = "WMA") -> List[float]:
    """
    Generate `periods` future demand forecasts by iteratively applying the
    chosen method, appending each forecast to the working history.
    """
    work = list(historical)
    result: List[float] = []
    for _ in range(periods):
        if method == "SMA":
            val = moving_average(work, 3)
        elif method == "ES":
            val = exponential_smoothing(work)
        else:  # default WMA
            val = weighted_moving_average(work, 3)
        result.append(round(val, 2))
        work.append(val)
    return result
