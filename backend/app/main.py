from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import products, bom, forecast, planning, mrp, cost

# Create tables on startup (use Alembic for production migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Production Line Planning API",
    description="REST API for production planning, MRP, forecasting, and cost analysis.",
    version="1.0.0",
)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(products.router)
app.include_router(bom.router)
app.include_router(forecast.router)
app.include_router(planning.router)
app.include_router(mrp.router)
app.include_router(cost.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "Production Line API is running"}
