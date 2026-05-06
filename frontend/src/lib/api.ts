const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  category: string;
  lead_time_days: number;
  past_demand_week1: number;
  past_demand_week2: number;
  past_demand_week3: number;
  past_demand_week4: number;
  past_demand_week5: number;
  past_demand_week6: number;
  setup_cost: number;
  holding_cost_per_unit: number;
  unit_cost: number;
  safety_stock: number;
  initial_inventory: number;
}

export interface ProductCreate extends Omit<Product, "id"> {}

export interface BOMEntry {
  id: number;
  parent_product_id: number;
  component: string;
  quantity_per_unit: number;
  component_lead_time_days: number;
  component_unit_cost: number;
}

export interface BOMEntryCreate extends Omit<BOMEntry, "id"> {}

export interface ForecastResponse {
  product_id: number;
  product_name: string;
  historical: number[];
  forecast: number[];
  method: string;
}

export interface PeriodPlan {
  period: number;
  gross_requirement: number;
  scheduled_receipts: number;
  projected_inventory: number;
  net_requirement: number;
  planned_order: number;
}

export interface PlanningResponse {
  product_id: number;
  product_name: string;
  method: string;
  plan: PeriodPlan[];
  total_cost: number;
}

export interface MRPComponentPlan {
  component: string;
  quantity_per_unit: number;
  component_lead_time_days: number;
  orders: number[];
}

export interface MRPResponse {
  product_id: number;
  product_name: string;
  parent_plan: number[];
  components: MRPComponentPlan[];
}

export interface MethodCost {
  method: string;
  total_cost: number;
  setup_cost: number;
  holding_cost: number;
  production_cost: number;
  num_orders: number;
}

export interface CostResponse {
  product_id: number;
  product_name: string;
  methods: MethodCost[];
  recommended: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = () => request<Product[]>("/products/");

export const getProduct = (id: number) => request<Product>(`/products/${id}`);

export const createProduct = (data: ProductCreate) =>
  request<Product>("/products/", { method: "POST", body: JSON.stringify(data) });

export const deleteProduct = (id: number) =>
  fetch(`${BASE}/products/${id}`, { method: "DELETE" });

// ─── BOM ──────────────────────────────────────────────────────────────────────

export const getBOM = (productId?: number) =>
  request<BOMEntry[]>(`/bom/${productId !== undefined ? `?product_id=${productId}` : ""}`);

export const createBOMEntry = (data: BOMEntryCreate) =>
  request<BOMEntry>("/bom/", { method: "POST", body: JSON.stringify(data) });

export const deleteBOMEntry = (id: number) =>
  fetch(`${BASE}/bom/${id}`, { method: "DELETE" });

// ─── Forecast ─────────────────────────────────────────────────────────────────

export const forecastDemand = (productId: number, periods = 4) =>
  request<ForecastResponse>("/forecast/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, periods }),
  });

// ─── Planning ─────────────────────────────────────────────────────────────────

export const runPlanning = (
  productId: number,
  method: string,
  periods = 6,
  capacityPerPeriod?: number
) =>
  request<PlanningResponse>("/planning/", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      method,
      periods,
      capacity_per_period: capacityPerPeriod ?? null,
    }),
  });

// ─── MRP ──────────────────────────────────────────────────────────────────────

export const runMRP = (productId: number, periods = 6) =>
  request<MRPResponse>("/mrp/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, periods }),
  });

// ─── Cost Analysis ────────────────────────────────────────────────────────────

export const runCostAnalysis = (
  productId: number,
  periods = 6,
  capacityPerPeriod?: number
) =>
  request<CostResponse>("/cost/", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      periods,
      capacity_per_period: capacityPerPeriod ?? null,
    }),
  });
