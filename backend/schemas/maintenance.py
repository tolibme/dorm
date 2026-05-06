from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MaintenanceBase(BaseModel):
    room_id: int
    student_id: int
    category: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = "medium"


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    assigned_to: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    resolved_at: Optional[datetime] = None


class MaintenanceResponse(MaintenanceBase):
    request_id: int
    assigned_to: Optional[int] = None
    status: str
    submitted_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
