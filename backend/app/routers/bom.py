from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BOMEntry, Product
from app.schemas import BOMEntryCreate, BOMEntryRead

router = APIRouter(prefix="/bom", tags=["bom"])


@router.get("/", response_model=List[BOMEntryRead])
def list_bom(product_id: int = None, db: Session = Depends(get_db)):
    query = db.query(BOMEntry)
    if product_id is not None:
        query = query.filter(BOMEntry.parent_product_id == product_id)
    return query.all()


@router.post("/", response_model=BOMEntryRead, status_code=201)
def create_bom_entry(payload: BOMEntryCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.parent_product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Parent product not found")
    entry = BOMEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}", status_code=204)
def delete_bom_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(BOMEntry).filter(BOMEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="BOM entry not found")
    db.delete(entry)
    db.commit()
