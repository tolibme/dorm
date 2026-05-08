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
    room_id: Optional[int] = None
    check_out_date: Optional[date] = None


class ApplicationResponse(ApplicationBase):
    application_id: int
    status: str
    applied_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    student_name: Optional[str] = None
    dorm_name: Optional[str] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_relations(cls, app) -> "ApplicationResponse":
        return cls(
            application_id=app.application_id,
            student_id=app.student_id,
            dorm_id=app.dorm_id,
            preferred_move_in=app.preferred_move_in,
            room_preference=app.room_preference,
            status=app.status,
            applied_at=app.applied_at,
            reviewed_at=app.reviewed_at,
            reviewed_by=app.reviewed_by,
            student_name=app.student.full_name if app.student else None,
            dorm_name=app.dormitory.name if app.dormitory else None,
        )
