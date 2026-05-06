from pydantic import BaseModel
from typing import Optional, List


# ─── Product ──────────────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str
    category: str
    lead_time_days: int = 7
    past_demand_week1: float = 0.0
    past_demand_week2: float = 0.0
    past_demand_week3: float = 0.0
    past_demand_week4: float = 0.0
    past_demand_week5: float = 0.0
    past_demand_week6: float = 0.0
    setup_cost: float = 0.0
    holding_cost_per_unit: float = 0.0
    unit_cost: float = 0.0
    safety_stock: float = 0.0
    initial_inventory: float = 0.0


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: int

    model_config = {"from_attributes": True}


# ─── BOM Entry ────────────────────────────────────────────────────────────────

class BOMEntryBase(BaseModel):
    parent_product_id: int
    component: str
    quantity_per_unit: float
    component_lead_time_days: int = 0
    component_unit_cost: float = 0.0


class BOMEntryCreate(BOMEntryBase):
    pass


class BOMEntryRead(BOMEntryBase):
    id: int

    model_config = {"from_attributes": True}


# ─── Forecast ─────────────────────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    product_id: int
    periods: int = 4


class ForecastResponse(BaseModel):
    product_id: int
    product_name: str
    historical: List[float]
    forecast: List[float]
    method: str


# ─── Planning ─────────────────────────────────────────────────────────────────

class PlanningRequest(BaseModel):
    product_id: int
    method: str  # "L4L" | "EOQ" | "FixedPeriod"
    periods: int = 6
    capacity_per_period: Optional[float] = None
    lead_time_override: Optional[int] = None


class PeriodPlan(BaseModel):
    period: int
    gross_requirement: float
    scheduled_receipts: float
    projected_inventory: float
    net_requirement: float
    planned_order: float


class PlanningResponse(BaseModel):
    product_id: int
    product_name: str
    method: str
    plan: List[PeriodPlan]
    total_cost: float


# ─── MRP ──────────────────────────────────────────────────────────────────────

class MRPRequest(BaseModel):
    product_id: int
    periods: int = 6


class MRPComponentPlan(BaseModel):
    component: str
    quantity_per_unit: float
    component_lead_time_days: int
    orders: List[float]


class MRPResponse(BaseModel):
    product_id: int
    product_name: str
    parent_plan: List[float]
    components: List[MRPComponentPlan]


# ─── Cost Analysis ────────────────────────────────────────────────────────────

class CostRequest(BaseModel):
    product_id: int
    periods: int = 6
    capacity_per_period: Optional[float] = None


class MethodCost(BaseModel):
    method: str
    total_cost: float
    setup_cost: float
    holding_cost: float
    production_cost: float
    num_orders: int


class CostResponse(BaseModel):
    product_id: int
    product_name: str
    methods: List[MethodCost]
    recommended: str
