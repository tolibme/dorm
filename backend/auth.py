import os
import bcrypt
from datetime import datetime, timedelta
from typing import Literal
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

import models
from database import get_db

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "yoursecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

BCRYPT_MAX_BYTES = 72

bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    user_id: int
    role: Literal["student", "staff"]
    name: str


def hash_password(password: str) -> str:
    if len(password.encode("utf-8")) > BCRYPT_MAX_BYTES:
        raise ValueError(f"Password must be at most {BCRYPT_MAX_BYTES} bytes")
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    if len(plain.encode("utf-8")) > BCRYPT_MAX_BYTES:
        return False
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict) -> str:
    payload = {**data, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    role = payload.get("role")
    if user_id is None or role not in ("student", "staff"):
        raise HTTPException(status_code=401, detail="Invalid token payload")

    if role == "student":
        row = db.query(models.Student).filter(models.Student.student_id == int(user_id)).first()
    else:
        row = db.query(models.Staff).filter(models.Staff.staff_id == int(user_id)).first()
    if not row:
        raise HTTPException(status_code=401, detail="User no longer exists")

    return CurrentUser(user_id=int(user_id), role=role, name=row.full_name)


def require_staff(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "staff":
        raise HTTPException(status_code=403, detail="Staff access required")
    return user


def require_student(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return user
