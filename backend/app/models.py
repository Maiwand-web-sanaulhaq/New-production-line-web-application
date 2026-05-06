from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    lead_time_days = Column(Integer, default=7)

    past_demand_week1 = Column(Float, default=0.0)
    past_demand_week2 = Column(Float, default=0.0)
    past_demand_week3 = Column(Float, default=0.0)
    past_demand_week4 = Column(Float, default=0.0)
    past_demand_week5 = Column(Float, default=0.0)
    past_demand_week6 = Column(Float, default=0.0)

    setup_cost = Column(Float, default=0.0)
    holding_cost_per_unit = Column(Float, default=0.0)
    unit_cost = Column(Float, default=0.0)
    safety_stock = Column(Float, default=0.0)
    initial_inventory = Column(Float, default=0.0)

    bom_entries = relationship("BOMEntry", back_populates="parent", cascade="all, delete-orphan")


class BOMEntry(Base):
    __tablename__ = "bom_entries"

    id = Column(Integer, primary_key=True, index=True)
    parent_product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    component = Column(String, nullable=False)
    quantity_per_unit = Column(Float, nullable=False)
    component_lead_time_days = Column(Integer, default=0)
    component_unit_cost = Column(Float, default=0.0)

    parent = relationship("Product", back_populates="bom_entries")
