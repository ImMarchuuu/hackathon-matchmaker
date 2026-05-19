from typing import Optional

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthUserInfo(BaseModel):
    id: str
    displayName: str
    email: str
    avatarUrl: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: AuthUserInfo
