from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
from schemas.auth import LoginRequest, TokenResponse
from auth import verify_password, create_access_token
from database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.email == payload.email).first()
    if student and student.password_hash and verify_password(payload.password, student.password_hash):
        token = create_access_token({"sub": str(student.student_id), "role": "student"})
        return TokenResponse(token=token, role="student", user_id=student.student_id, name=student.full_name)

    staff = db.query(models.Staff).filter(models.Staff.email == payload.email).first()
    if staff and staff.password_hash and verify_password(payload.password, staff.password_hash):
        token = create_access_token({"sub": str(staff.staff_id), "role": "staff"})
        return TokenResponse(token=token, role="staff", user_id=staff.staff_id, name=staff.full_name)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
