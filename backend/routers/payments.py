from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
from schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from database import get_db

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/", response_model=List[PaymentResponse])
def list_payments(db: Session = Depends(get_db)):
    return db.query(models.Payment).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    return obj


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    obj = models.Payment(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{payment_id}", response_model=PaymentResponse)
def update_payment(payment_id: int, payload: PaymentUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(obj)
    db.commit()
