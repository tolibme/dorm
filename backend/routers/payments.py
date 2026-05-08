from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

import models
from schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse
from database import get_db
from auth import get_current_user, require_staff, CurrentUser

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("/", response_model=List[PaymentResponse])
def list_payments(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    q = db.query(models.Payment)
    if user.role == "student":
        q = q.filter(models.Payment.student_id == user.user_id)
    if status_filter:
        q = q.filter(models.Payment.status == status_filter)
    return q.order_by(models.Payment.due_date.desc()).offset(skip).limit(limit).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    obj = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    if user.role == "student" and obj.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot access other payments")
    return obj


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_staff)])
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    obj = models.Payment(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int,
    payload: PaymentUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    obj = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    if user.role == "student" and obj.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot update other payments")

    update_data = payload.model_dump(exclude_unset=True)
    becoming_paid = update_data.get("status") == "paid" and obj.status != "paid"

    for k, v in update_data.items():
        setattr(obj, k, v)

    if becoming_paid:
        if not obj.paid_date:
            obj.paid_date = date.today()
        if not obj.receipt_number:
            obj.receipt_number = f"RCPT-{obj.paid_date.year}-{obj.payment_id:06d}"

    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_staff)])
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(obj)
    db.commit()
