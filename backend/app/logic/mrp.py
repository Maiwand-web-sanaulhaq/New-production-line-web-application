"""
MRP explosion logic: given parent planned orders + BOM, compute component
order requirements offset by component lead time.
"""
from typing import List

from app.schemas import MRPComponentPlan


def explode_mrp(
    parent_orders: List[float],
    bom_entries: list,  # list of BOMEntry ORM objects
) -> List[MRPComponentPlan]:
    """
    For each BOM component, multiply parent order qty by qty_per_unit and
    shift orders left by component_lead_time_days (in weeks, rounded).
    """
    results: List[MRPComponentPlan] = []
    n = len(parent_orders)

    for entry in bom_entries:
        lead_weeks = max(0, round(entry.component_lead_time_days / 7))
        orders: List[float] = []
        for i in range(n):
            # The component order must be placed `lead_weeks` periods earlier
            source_period = i + lead_weeks
            if source_period < n:
                qty = parent_orders[source_period] * entry.quantity_per_unit
            else:
                qty = 0.0
            orders.append(round(qty, 2))

        results.append(MRPComponentPlan(
            component=entry.component,
            quantity_per_unit=entry.quantity_per_unit,
            component_lead_time_days=entry.component_lead_time_days,
            orders=orders,
        ))

    return results
