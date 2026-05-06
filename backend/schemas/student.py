from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class StudentBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    national_id: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    faculty: Optional[str] = None
    year_of_study: Optional[int] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    national_id: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    faculty: Optional[str] = None
    year_of_study: Optional[int] = None


class StudentResponse(StudentBase):
    student_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
