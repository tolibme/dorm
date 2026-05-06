from pydantic import BaseModel
from typing import Optional


class DormitoryBase(BaseModel):
    name: str
    address: Optional[str] = None
    type: str
    total_rooms: Optional[int] = None
    staff_id: Optional[int] = None


class DormitoryCreate(DormitoryBase):
    pass


class DormitoryUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    type: Optional[str] = None
    total_rooms: Optional[int] = None
    staff_id: Optional[int] = None


class DormitoryResponse(DormitoryBase):
    dorm_id: int

    model_config = {"from_attributes": True}
