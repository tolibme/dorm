from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

import models
from database import get_db

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/occupancy")
def occupancy_by_dorm(db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.Dormitory.dorm_id,
            models.Dormitory.name,
            func.count(models.Room.room_id).label("total_rooms"),
            func.coalesce(func.sum(models.Room.current_occupancy), 0).label("total_occupied"),
            func.coalesce(func.sum(models.Room.capacity), 0).label("total_capacity"),
        )
        .join(models.Room, models.Room.dorm_id == models.Dormitory.dorm_id)
        .group_by(models.Dormitory.dorm_id, models.Dormitory.name)
        .all()
    )
    return [
        {
            "dorm_id": r.dorm_id,
            "name": r.name,
            "total_rooms": r.total_rooms,
            "total_occupied": r.total_occupied,
            "total_capacity": r.total_capacity,
            "occupancy_rate": round(r.total_occupied / r.total_capacity * 100, 1) if r.total_capacity else 0,
        }
        for r in rows
    ]


@router.get("/unpaid")
def unpaid_payments(db: Session = Depends(get_db)):
    today = date.today()
    db.query(models.Payment).filter(
        models.Payment.status == "unpaid",
        models.Payment.due_date < today,
    ).update({"status": "overdue"})
    db.commit()

    rows = (
        db.query(models.Payment, models.Student)
        .join(models.Student, models.Payment.student_id == models.Student.student_id)
        .filter(models.Payment.status.in_(["unpaid", "overdue"]))
        .all()
    )
    return [
        {
            "payment_id": p.payment_id,
            "student_id": s.student_id,
            "student_name": s.full_name,
            "amount": float(p.amount),
            "status": p.status,
            "due_date": p.due_date.isoformat(),
        }
        for p, s in rows
    ]


@router.get("/maintenance")
def maintenance_report(db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.Dormitory.name.label("dorm_name"),
            models.MaintenanceRequest.status,
            func.count(models.MaintenanceRequest.request_id).label("count"),
        )
        .join(models.Room, models.MaintenanceRequest.room_id == models.Room.room_id)
        .join(models.Dormitory, models.Room.dorm_id == models.Dormitory.dorm_id)
        .group_by(models.Dormitory.name, models.MaintenanceRequest.status)
        .all()
    )
    return [{"dorm_name": r.dorm_name, "status": r.status, "count": r.count} for r in rows]


@router.get("/monthly-occupancy")
def monthly_occupancy(db: Session = Depends(get_db)):
    rows = (
        db.query(
            func.date_trunc("month", models.Assignment.check_in_date).label("month"),
            func.count(models.Assignment.assignment_id).label("count"),
        )
        .group_by(func.date_trunc("month", models.Assignment.check_in_date))
        .order_by(func.date_trunc("month", models.Assignment.check_in_date))
        .all()
    )
    return [{"month": r.month.strftime("%Y-%m"), "count": r.count} for r in rows]
