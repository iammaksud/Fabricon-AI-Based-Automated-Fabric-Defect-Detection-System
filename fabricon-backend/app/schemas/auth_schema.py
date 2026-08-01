from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response payload returned upon successful login."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Internal schema for parsed JWT claims."""

    admin_id: Optional[int] = None
    email: Optional[str] = None


class AdminResponse(BaseModel):
    """Response payload for GET /auth/me."""

    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)