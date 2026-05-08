from pydantic import BaseModel, EmailStr, Field
from typing import Literal


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    role: Literal["student", "staff"]
    user_id: int
    name: str
