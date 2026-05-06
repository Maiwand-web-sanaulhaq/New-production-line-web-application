from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import ForecastRequest, ForecastResponse
from app.logic.forecasting import generate_forecast

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.post("/", response_model=ForecastResponse)
def forecast_demand(payload: ForecastRequest, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    historical = [
        product.past_demand_week1,
        product.past_demand_week2,
        product.past_demand_week3,
        product.past_demand_week4,
        product.past_demand_week5,
        product.past_demand_week6,
    ]

    forecasted = generate_forecast(historical, periods=payload.periods, method="WMA")

    return ForecastResponse(
        product_id=product.id,
        product_name=product.name,
        historical=historical,
        forecast=forecasted,
        method="Weighted Moving Average",
    )
