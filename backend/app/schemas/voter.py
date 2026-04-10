# app/schemas/voter.py
from dataclasses import Field

from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime
from typing import Optional


class VoterRegister(BaseModel):
    """What the frontend sends when signing up."""
    full_name: str
    email: EmailStr
    password: str


class VoterLogin(BaseModel):
    """Login request."""
    email: EmailStr
    password: str


class VoterResponse(BaseModel):
    """What the API sends back — never includes password."""
    id: UUID4
    email: str
    full_name: str
    is_verified: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True  # allows conversion from SQLAlchemy model
