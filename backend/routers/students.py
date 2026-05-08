from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

import models
from schemas.student import StudentCreate, StudentUpdate, StudentResponse
from database import get_db
from auth import get_current_user, require_staff, CurrentUser

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=List[StudentResponse], dependencies=[Depends(require_staff)])
def list_students(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str | None = Query(None),
):
    q = db.query(models.Student)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.Student.full_name.ilike(like))
            | (models.Student.email.ilike(like))
            | (models.Student.faculty.ilike(like))
        )
    return q.offset(skip).limit(limit).all()


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if user.role == "student" and user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Cannot access other students")
    obj = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")
    return obj


@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_staff)])
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
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if user.role == "student" and user.user_id != student_id:
        raise HTTPException(status_code=403, detail="Cannot update other students")
    obj = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_staff)])
def delete_student(student_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(obj)
    db.commit()
