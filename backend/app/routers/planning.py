from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import PlanningRequest, PlanningResponse
from app.logic.forecasting import generate_forecast
from app.logic.planning import plan_l4l, plan_eoq, plan_fixed_period, compute_total_cost

router = APIRouter(prefix="/planning", tags=["planning"])


def _get_gross_requirements(product: Product, periods: int):
    historical = [
        product.past_demand_week1,
        product.past_demand_week2,
        product.past_demand_week3,
        product.past_demand_week4,
        product.past_demand_week5,
        product.past_demand_week6,
    ]
    return generate_forecast(historical, periods=periods, method="WMA")


@router.post("/", response_model=PlanningResponse)
def run_planning(payload: PlanningRequest, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    gross = _get_gross_requirements(product, payload.periods)

    kwargs = dict(
        gross_requirements=gross,
        initial_inventory=product.initial_inventory,
        safety_stock=product.safety_stock,
        setup_cost=product.setup_cost,
        holding_cost=product.holding_cost_per_unit,
        unit_cost=product.unit_cost,
        capacity=payload.capacity_per_period,
    )

    method_map = {
        "L4L": plan_l4l,
        "EOQ": plan_eoq,
        "FixedPeriod": plan_fixed_period,
    }

    planner = method_map.get(payload.method)
    if planner is None:
        raise HTTPException(status_code=400, detail=f"Unknown method '{payload.method}'. Use L4L, EOQ, or FixedPeriod.")

    plans = planner(**kwargs)
    costs = compute_total_cost(plans, product.setup_cost, product.holding_cost_per_unit, product.unit_cost)

    return PlanningResponse(
        product_id=product.id,
        product_name=product.name,
        method=payload.method,
        plan=plans,
        total_cost=costs["total_cost"],
    )
