from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import CostRequest, CostResponse
from app.logic.forecasting import generate_forecast
from app.logic.cost import compare_methods

router = APIRouter(prefix="/cost", tags=["cost"])


@router.post("/", response_model=CostResponse)
def run_cost_analysis(payload: CostRequest, db: Session = Depends(get_db)):
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
    gross = generate_forecast(historical, periods=payload.periods, method="WMA")

    methods = compare_methods(
        gross_requirements=gross,
        initial_inventory=product.initial_inventory,
        safety_stock=product.safety_stock,
        setup_cost=product.setup_cost,
        holding_cost=product.holding_cost_per_unit,
        unit_cost=product.unit_cost,
        capacity=payload.capacity_per_period,
    )

    recommended = min(methods, key=lambda m: m.total_cost).method

    return CostResponse(
        product_id=product.id,
        product_name=product.name,
        methods=methods,
        recommended=recommended,
    )
