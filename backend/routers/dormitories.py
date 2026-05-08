from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

import models
from schemas.dormitory import DormitoryCreate, DormitoryUpdate, DormitoryResponse
from database import get_db
from auth import get_current_user, require_staff

router = APIRouter(prefix="/dormitories", tags=["Dormitories"])


@router.get("/", response_model=List[DormitoryResponse], dependencies=[Depends(get_current_user)])
def list_dormitories(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return db.query(models.Dormitory).offset(skip).limit(limit).all()


@router.get("/{dorm_id}", response_model=DormitoryResponse, dependencies=[Depends(get_current_user)])
def get_dormitory(dorm_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Dormitory).filter(models.Dormitory.dorm_id == dorm_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Dormitory not found")
    return obj


@router.post("/", response_model=DormitoryResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_staff)])
def create_dormitory(payload: DormitoryCreate, db: Session = Depends(get_db)):
    if payload.type not in ("mixed", "male", "female"):
        raise HTTPException(status_code=400, detail="type must be mixed, male, or female")
    if payload.staff_id and not db.query(models.Staff).filter(models.Staff.staff_id == payload.staff_id).first():
        raise HTTPException(status_code=404, detail="Staff not found")
    obj = models.Dormitory(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{dorm_id}", response_model=DormitoryResponse, dependencies=[Depends(require_staff)])
def update_dormitory(dorm_id: int, payload: DormitoryUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Dormitory).filter(models.Dormitory.dorm_id == dorm_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Dormitory not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{dorm_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_staff)])
def delete_dormitory(dorm_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Dormitory).filter(models.Dormitory.dorm_id == dorm_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Dormitory not found")
    db.delete(obj)
    db.commit()
