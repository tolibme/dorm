from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date, datetime


class ApplicationBase(BaseModel):
    student_id: int
    dorm_id: int
    preferred_move_in: Optional[date] = None
    room_preference: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    preferred_move_in: Optional[date] = None
    room_preference: Optional[str] = None


class ApplicationReview(BaseModel):
    action: Literal["approved", "rejected"]
    reviewed_by: int
    room_id: Optional[int] = None
    check_out_date: Optional[date] = None


class ApplicationResponse(ApplicationBase):
    application_id: int
    status: str
    applied_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None

    model_config = {"from_attributes": True}
