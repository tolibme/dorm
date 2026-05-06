from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal


class PaymentBase(BaseModel):
    student_id: int
    assignment_id: int
    amount: Decimal
    payment_type: Optional[str] = "monthly"
    due_date: date


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    paid_date: Optional[date] = None
    receipt_number: Optional[str] = None


class PaymentResponse(PaymentBase):
    payment_id: int
    status: str
    paid_date: Optional[date] = None
    receipt_number: Optional[str] = None

    model_config = {"from_attributes": True}
