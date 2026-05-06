from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class RoomBase(BaseModel):
    dorm_id: int
    room_number: str
    room_type: Optional[str] = None
    capacity: int
    monthly_fee: Optional[Decimal] = None


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    monthly_fee: Optional[Decimal] = None
    status: Optional[str] = None


class RoomResponse(RoomBase):
    room_id: int
    current_occupancy: int
    status: str

    model_config = {"from_attributes": True}
