from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class AssignmentBase(BaseModel):
    student_id: int
    room_id: int
    application_id: int
    check_in_date: date
    check_out_date: Optional[date] = None


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentUpdate(BaseModel):
    check_out_date: Optional[date] = None
    status: Optional[str] = None


class AssignmentResponse(AssignmentBase):
    assignment_id: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
