from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

import models
from schemas.room import RoomCreate, RoomUpdate, RoomResponse
from database import get_db
from auth import get_current_user, require_staff

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("/available", response_model=List[RoomResponse], dependencies=[Depends(get_current_user)])
def get_available_rooms(
    db: Session = Depends(get_db),
    dorm_id: int | None = Query(None),
):
    q = db.query(models.Room).filter(
        models.Room.current_occupancy < models.Room.capacity,
        models.Room.status != "maintenance",
    )
    if dorm_id is not None:
        q = q.filter(models.Room.dorm_id == dorm_id)
    return q.all()


@router.get("/", response_model=List[RoomResponse], dependencies=[Depends(get_current_user)])
def list_rooms(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    dorm_id: int | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
):
    q = db.query(models.Room)
    if dorm_id is not None:
        q = q.filter(models.Room.dorm_id == dorm_id)
    if status_filter:
        q = q.filter(models.Room.status == status_filter)
    return q.offset(skip).limit(limit).all()


@router.get("/{room_id}", response_model=RoomResponse, dependencies=[Depends(get_current_user)])
def get_room(room_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    return obj


@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_staff)])
def create_room(payload: RoomCreate, db: Session = Depends(get_db)):
    if not db.query(models.Dormitory).filter(models.Dormitory.dorm_id == payload.dorm_id).first():
        raise HTTPException(status_code=404, detail="Dormitory not found")
    obj = models.Room(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{room_id}", response_model=RoomResponse, dependencies=[Depends(require_staff)])
def update_room(room_id: int, payload: RoomUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_staff)])
def delete_room(room_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(obj)
    db.commit()
