from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import MRPRequest, MRPResponse
from app.logic.forecasting import generate_forecast
from app.logic.mrp import explode_mrp
from app.logic.planning import plan_l4l

router = APIRouter(prefix="/mrp", tags=["mrp"])


@router.post("/", response_model=MRPResponse)
def run_mrp(payload: MRPRequest, db: Session = Depends(get_db)):
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

    # Use L4L to get parent planned orders
    plans = plan_l4l(
        gross_requirements=gross,
        initial_inventory=product.initial_inventory,
        safety_stock=product.safety_stock,
        setup_cost=product.setup_cost,
        holding_cost=product.holding_cost_per_unit,
        unit_cost=product.unit_cost,
    )
    parent_orders = [p.planned_order for p in plans]

    bom_entries = product.bom_entries
    component_plans = explode_mrp(parent_orders, bom_entries)

    return MRPResponse(
        product_id=product.id,
        product_name=product.name,
        parent_plan=parent_orders,
        components=component_plans,
    )
