from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

import models
from schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from database import get_db
from auth import get_current_user, require_staff, CurrentUser

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.get("/", response_model=List[AssignmentResponse])
def list_assignments(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    q = db.query(models.Assignment)
    if user.role == "student":
        q = q.filter(models.Assignment.student_id == user.user_id)
    if status_filter:
        q = q.filter(models.Assignment.status == status_filter)
    return q.offset(skip).limit(limit).all()


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    obj = db.query(models.Assignment).filter(models.Assignment.assignment_id == assignment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if user.role == "student" and obj.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot access other assignments")
    return obj


@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_staff)])
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db)):
    room = (
        db.query(models.Room)
        .filter(models.Room.room_id == payload.room_id)
        .with_for_update()
        .first()
    )
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.current_occupancy >= room.capacity:
        raise HTTPException(status_code=400, detail="Room is at full capacity")
    active = db.query(models.Assignment).filter(
        models.Assignment.student_id == payload.student_id,
        models.Assignment.status == "active",
    ).first()
    if active:
        raise HTTPException(status_code=400, detail="Student already has an active assignment")
    obj = models.Assignment(**payload.model_dump())
    db.add(obj)
    room.current_occupancy += 1
    if room.current_occupancy >= room.capacity:
        room.status = "full"
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{assignment_id}", response_model=AssignmentResponse, dependencies=[Depends(require_staff)])
def update_assignment(assignment_id: int, payload: AssignmentUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Assignment).filter(models.Assignment.assignment_id == assignment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Assignment not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_staff)])
def delete_assignment(assignment_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Assignment).filter(models.Assignment.assignment_id == assignment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(obj)
    db.commit()


@router.patch("/{assignment_id}/checkout", response_model=AssignmentResponse, dependencies=[Depends(require_staff)])
def checkout(assignment_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Assignment).filter(models.Assignment.assignment_id == assignment_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if obj.status != "active":
        raise HTTPException(status_code=400, detail="Assignment is not active")

    obj.status = "completed"
    obj.check_out_date = date.today()

    room = (
        db.query(models.Room)
        .filter(models.Room.room_id == obj.room_id)
        .with_for_update()
        .first()
    )
    if room and room.current_occupancy > 0:
        room.current_occupancy -= 1
    if room and room.status == "full":
        room.status = "available"

    db.commit()
    db.refresh(obj)
    return obj
