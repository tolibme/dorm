from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

import models
from schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from database import get_db
from auth import get_current_user, require_staff, CurrentUser

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.get("/", response_model=List[MaintenanceResponse])
def list_requests(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    q = db.query(models.MaintenanceRequest)
    if user.role == "student":
        q = q.filter(models.MaintenanceRequest.student_id == user.user_id)
    if status_filter:
        q = q.filter(models.MaintenanceRequest.status == status_filter)
    return q.order_by(models.MaintenanceRequest.submitted_at.desc()).offset(skip).limit(limit).all()


@router.get("/{request_id}", response_model=MaintenanceResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    obj = db.query(models.MaintenanceRequest).filter(models.MaintenanceRequest.request_id == request_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    if user.role == "student" and obj.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot access other requests")
    return obj


@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if user.role == "student" and payload.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot file a request on behalf of another student")
    if not db.query(models.Room).filter(models.Room.room_id == payload.room_id).first():
        raise HTTPException(status_code=404, detail="Room not found")
    if not db.query(models.Student).filter(models.Student.student_id == payload.student_id).first():
        raise HTTPException(status_code=404, detail="Student not found")
    obj = models.MaintenanceRequest(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{request_id}", response_model=MaintenanceResponse, dependencies=[Depends(require_staff)])
def update_request(request_id: int, payload: MaintenanceUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.MaintenanceRequest).filter(models.MaintenanceRequest.request_id == request_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    if payload.assigned_to and not db.query(models.Staff).filter(models.Staff.staff_id == payload.assigned_to).first():
        raise HTTPException(status_code=404, detail="Staff not found")
    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("status") == "resolved" and not update_data.get("resolved_at"):
        update_data["resolved_at"] = datetime.utcnow()
    for k, v in update_data.items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_staff)])
def delete_request(request_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.MaintenanceRequest).filter(models.MaintenanceRequest.request_id == request_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    db.delete(obj)
    db.commit()
