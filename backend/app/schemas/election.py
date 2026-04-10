# app/schemas/election.py
from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List
from app.models.election import ElectionStatus

class CandidateCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CandidateResponse(BaseModel):
    id: UUID4
    name: str
    description: Optional[str]
    vote_count: int

    class Config:
        from_attributes = True

class ElectionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    candidates: List[CandidateCreate]

class ElectionResponse(BaseModel):
    id: UUID4
    title: str
    description: Optional[str]
    status: ElectionStatus
    starts_at: datetime
    ends_at: datetime
    candidates: List[CandidateResponse]

    class Config:
        from_attributes = True