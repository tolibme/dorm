from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

import models
from schemas.staff import StaffCreate, StaffUpdate, StaffResponse
from database import get_db
from auth import require_staff

router = APIRouter(prefix="/staff", tags=["Staff"], dependencies=[Depends(require_staff)])


@router.get("/", response_model=List[StaffResponse])
def list_staff(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return db.query(models.Staff).offset(skip).limit(limit).all()


@router.get("/{staff_id}", response_model=StaffResponse)
def get_staff(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.staff_id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    return staff


@router.post("/", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff(payload: StaffCreate, db: Session = Depends(get_db)):
    if db.query(models.Staff).filter(models.Staff.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    obj = models.Staff(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{staff_id}", response_model=StaffResponse)
def update_staff(staff_id: int, payload: StaffUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Staff).filter(models.Staff.staff_id == staff_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Staff not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(staff_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Staff).filter(models.Staff.staff_id == staff_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Staff not found")
    db.delete(obj)
    db.commit()
