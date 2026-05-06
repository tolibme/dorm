from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
from schemas.student import StudentCreate, StudentUpdate, StudentResponse
from database import get_db

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=List[StudentResponse])
def list_students(db: Session = Depends(get_db)):
    return db.query(models.Student).all()


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")
    return obj


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    if db.query(models.Student).filter(models.Student.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if payload.national_id and db.query(models.Student).filter(models.Student.national_id == payload.national_id).first():
        raise HTTPException(status_code=400, detail="National ID already registered")
    obj = models.Student(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, payload: StudentUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(obj)
    db.commit()
