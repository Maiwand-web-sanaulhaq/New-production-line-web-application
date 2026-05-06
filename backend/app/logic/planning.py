"""
Production planning logic: Lot-for-Lot (L4L), Economic Order Quantity (EOQ),
and Fixed Period ordering, with capacity and lead-time support.
"""
from typing import List, Optional
import math

from app.schemas import PeriodPlan


def _net_requirements(
    gross: List[float],
    initial_inventory: float,
    safety_stock: float,
) -> List[dict]:
    """
    Compute period-by-period MRP record.
    Returns list of dicts with keys matching PeriodPlan fields.
    """
    records = []
    inv = initial_inventory
    for i, gr in enumerate(gross):
        sched = 0.0
        projected = inv + sched - gr
        nr = max(0.0, safety_stock - projected)
        records.append({
            "period": i + 1,
            "gross_requirement": gr,
            "scheduled_receipts": sched,
            "projected_inventory": projected if nr == 0 else inv + sched - gr + nr,
            "net_requirement": nr,
            "_inv_before": inv,
        })
        inv = records[-1]["projected_inventory"]
    return records


def plan_l4l(
    gross_requirements: List[float],
    initial_inventory: float,
    safety_stock: float,
    setup_cost: float,
    holding_cost: float,
    unit_cost: float,
    capacity: Optional[float] = None,
) -> List[PeriodPlan]:
    """Lot-for-Lot: order exactly the net requirement each period."""
    records = _net_requirements(gross_requirements, initial_inventory, safety_stock)
    plans = []
    for r in records:
        order = r["net_requirement"]
        if capacity is not None:
            order = min(order, capacity)
        plans.append(PeriodPlan(
            period=r["period"],
            gross_requirement=r["gross_requirement"],
            scheduled_receipts=r["scheduled_receipts"],
            projected_inventory=r["projected_inventory"],
            net_requirement=r["net_requirement"],
            planned_order=round(order, 2),
        ))
    return plans


def plan_eoq(
    gross_requirements: List[float],
    initial_inventory: float,
    safety_stock: float,
    setup_cost: float,
    holding_cost: float,
    unit_cost: float,
    capacity: Optional[float] = None,
) -> List[PeriodPlan]:
    """EOQ: order the economic order quantity whenever net requirement > 0."""
    annual_demand = sum(gross_requirements) * (52 / len(gross_requirements)) if gross_requirements else 0
    h = holding_cost if holding_cost > 0 else 1.0
    eoq = math.sqrt(2 * annual_demand * setup_cost / h) if annual_demand > 0 else 0.0
    if capacity is not None:
        eoq = min(eoq, capacity)
    eoq = max(eoq, 1.0)

    plans = []
    inv = initial_inventory
    for i, gr in enumerate(gross_requirements):
        sched = 0.0
        projected = inv + sched - gr
        nr = max(0.0, safety_stock - projected)
        order = math.ceil(nr / eoq) * eoq if nr > 0 else 0.0
        if capacity is not None:
            order = min(order, capacity)
        new_inv = inv + order - gr
        plans.append(PeriodPlan(
            period=i + 1,
            gross_requirement=gr,
            scheduled_receipts=sched,
            projected_inventory=round(new_inv, 2),
            net_requirement=round(nr, 2),
            planned_order=round(order, 2),
        ))
        inv = new_inv
    return plans


def plan_fixed_period(
    gross_requirements: List[float],
    initial_inventory: float,
    safety_stock: float,
    setup_cost: float,
    holding_cost: float,
    unit_cost: float,
    period_interval: int = 2,
    capacity: Optional[float] = None,
) -> List[PeriodPlan]:
    """Fixed Period: order to cover `period_interval` periods of demand at regular intervals."""
    plans = []
    inv = initial_inventory
    n = len(gross_requirements)
    for i, gr in enumerate(gross_requirements):
        sched = 0.0
        order = 0.0
        if i % period_interval == 0:
            future = sum(gross_requirements[i: i + period_interval])
            needed = future + safety_stock - inv
            order = max(0.0, needed)
            if capacity is not None:
                order = min(order, capacity)
        new_inv = inv + order - gr
        nr = max(0.0, safety_stock - (inv - gr))
        plans.append(PeriodPlan(
            period=i + 1,
            gross_requirement=gr,
            scheduled_receipts=sched,
            projected_inventory=round(new_inv, 2),
            net_requirement=round(nr, 2),
            planned_order=round(order, 2),
        ))
        inv = new_inv
    return plans


def compute_total_cost(
    plans: List[PeriodPlan],
    setup_cost: float,
    holding_cost: float,
    unit_cost: float,
) -> dict:
    """Compute total, setup, holding, and production costs for a plan."""
    num_orders = sum(1 for p in plans if p.planned_order > 0)
    total_setup = num_orders * setup_cost
    total_holding = sum(max(p.projected_inventory, 0) * holding_cost for p in plans)
    total_production = sum(p.planned_order * unit_cost for p in plans)
    total = total_setup + total_holding + total_production
    return {
        "total_cost": round(total, 2),
        "setup_cost": round(total_setup, 2),
        "holding_cost": round(total_holding, 2),
        "production_cost": round(total_production, 2),
        "num_orders": num_orders,
    }
