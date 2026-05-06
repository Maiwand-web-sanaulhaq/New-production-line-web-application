"""
Cost analysis: run all three planning methods and compare total costs.
"""
from typing import List, Optional

from app.logic.planning import plan_l4l, plan_eoq, plan_fixed_period, compute_total_cost
from app.schemas import MethodCost


def compare_methods(
    gross_requirements: List[float],
    initial_inventory: float,
    safety_stock: float,
    setup_cost: float,
    holding_cost: float,
    unit_cost: float,
    capacity: Optional[float] = None,
) -> List[MethodCost]:
    results: List[MethodCost] = []

    for method_name, planner in [
        ("L4L", plan_l4l),
        ("EOQ", plan_eoq),
        ("FixedPeriod", plan_fixed_period),
    ]:
        plans = planner(
            gross_requirements=gross_requirements,
            initial_inventory=initial_inventory,
            safety_stock=safety_stock,
            setup_cost=setup_cost,
            holding_cost=holding_cost,
            unit_cost=unit_cost,
            capacity=capacity,
        )
        costs = compute_total_cost(plans, setup_cost, holding_cost, unit_cost)
        results.append(MethodCost(
            method=method_name,
            total_cost=costs["total_cost"],
            setup_cost=costs["setup_cost"],
            holding_cost=costs["holding_cost"],
            production_cost=costs["production_cost"],
            num_orders=costs["num_orders"],
        ))

    return results
