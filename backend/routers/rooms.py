from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
from schemas.room import RoomCreate, RoomUpdate, RoomResponse
from database import get_db

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("/available", response_model=List[RoomResponse])
def get_available_rooms(db: Session = Depends(get_db)):
    return (
        db.query(models.Room)
        .filter(
            models.Room.current_occupancy < models.Room.capacity,
            models.Room.status != "maintenance",
        )
        .all()
    )


@router.get("/", response_model=List[RoomResponse])
def list_rooms(db: Session = Depends(get_db)):
    return db.query(models.Room).all()


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    return obj


@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(payload: RoomCreate, db: Session = Depends(get_db)):
    if not db.query(models.Dormitory).filter(models.Dormitory.dorm_id == payload.dorm_id).first():
        raise HTTPException(status_code=404, detail="Dormitory not found")
    obj = models.Room(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{room_id}", response_model=RoomResponse)
def update_room(room_id: int, payload: RoomUpdate, db: Session = Depends(get_db)):
    obj = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    obj = db.query(models.Room).filter(models.Room.room_id == room_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(obj)
    db.commit()
