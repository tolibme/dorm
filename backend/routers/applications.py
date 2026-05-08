from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

import models
from schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationReview, ApplicationResponse,
)
from database import get_db
from auth import get_current_user, require_staff, CurrentUser

router = APIRouter(prefix="/applications", tags=["Applications"])


def _eager_query(db: Session):
    return db.query(models.Application).options(
        joinedload(models.Application.student),
        joinedload(models.Application.dormitory),
    )


@router.get("/", response_model=List[ApplicationResponse])
def list_applications(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    q = _eager_query(db)
    if user.role == "student":
        q = q.filter(models.Application.student_id == user.user_id)
    if status_filter:
        q = q.filter(models.Application.status == status_filter)
    rows = q.order_by(models.Application.applied_at.desc()).offset(skip).limit(limit).all()
    return [ApplicationResponse.from_orm_with_relations(a) for a in rows]


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    obj = _eager_query(db).filter(models.Application.application_id == application_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")
    if user.role == "student" and obj.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot access other applications")
    return ApplicationResponse.from_orm_with_relations(obj)


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if user.role == "student" and payload.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot apply on behalf of another student")
    if not db.query(models.Student).filter(models.Student.student_id == payload.student_id).first():
        raise HTTPException(status_code=404, detail="Student not found")
    if not db.query(models.Dormitory).filter(models.Dormitory.dorm_id == payload.dorm_id).first():
        raise HTTPException(status_code=404, detail="Dormitory not found")
    existing = db.query(models.Application).filter(
        models.Application.student_id == payload.student_id,
        models.Application.status == "pending",
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already has a pending application")
    obj = models.Application(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    obj = _eager_query(db).filter(models.Application.application_id == obj.application_id).first()
    return ApplicationResponse.from_orm_with_relations(obj)


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    obj = db.query(models.Application).filter(models.Application.application_id == application_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")
    if user.role == "student" and obj.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot update other applications")
    if obj.status != "pending":
        raise HTTPException(status_code=400, detail="Cannot update a reviewed application")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    obj = _eager_query(db).filter(models.Application.application_id == application_id).first()
    return ApplicationResponse.from_orm_with_relations(obj)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    obj = db.query(models.Application).filter(models.Application.application_id == application_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")
    if user.role == "student" and obj.student_id != user.user_id:
        raise HTTPException(status_code=403, detail="Cannot delete other applications")
    db.delete(obj)
    db.commit()


@router.patch("/{application_id}/review", response_model=ApplicationResponse)
def review_application(
    application_id: int,
    review: ApplicationReview,
    db: Session = Depends(get_db),
    staff_user: CurrentUser = Depends(require_staff),
):
    app = db.query(models.Application).filter(models.Application.application_id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.status != "pending":
        raise HTTPException(status_code=400, detail="Application already reviewed")

    app.status = review.action
    app.reviewed_at = datetime.utcnow()
    app.reviewed_by = staff_user.user_id

    if review.action == "approved":
        if not review.room_id:
            raise HTTPException(status_code=400, detail="room_id is required when approving")

        # Lock the room row to prevent two staff approving into the same last seat.
        room = (
            db.query(models.Room)
            .filter(models.Room.room_id == review.room_id)
            .with_for_update()
            .first()
        )
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        if room.current_occupancy >= room.capacity:
            raise HTTPException(status_code=400, detail="Room is at full capacity")

        active = db.query(models.Assignment).filter(
            models.Assignment.student_id == app.student_id,
            models.Assignment.status == "active",
        ).first()
        if active:
            raise HTTPException(status_code=400, detail="Student already has an active assignment")

        check_in = app.preferred_move_in or date.today()
        check_out = review.check_out_date

        assignment = models.Assignment(
            student_id=app.student_id,
            room_id=review.room_id,
            application_id=application_id,
            check_in_date=check_in,
            check_out_date=check_out,
            status="active",
        )
        db.add(assignment)
        db.flush()

        room.current_occupancy += 1
        if room.current_occupancy >= room.capacity:
            room.status = "full"

        if check_out and room.monthly_fee:
            current_due = check_in
            while current_due <= check_out:
                db.add(models.Payment(
                    student_id=app.student_id,
                    assignment_id=assignment.assignment_id,
                    amount=room.monthly_fee,
                    payment_type="monthly",
                    status="unpaid",
                    due_date=current_due,
                ))
                current_due = current_due + relativedelta(months=1)

    db.commit()
    db.refresh(app)
    app = _eager_query(db).filter(models.Application.application_id == application_id).first()
    return ApplicationResponse.from_orm_with_relations(app)
