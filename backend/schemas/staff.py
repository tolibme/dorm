from pydantic import BaseModel
from typing import Optional


class StaffBase(BaseModel):
    full_name: str
    role: str
    email: str
    phone: Optional[str] = None


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class StaffResponse(StaffBase):
    staff_id: int

    model_config = {"from_attributes": True}
