# app/models/election.py
import uuid
from sqlalchemy import Column, String, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class ElectionStatus(str, enum.Enum):
    draft  = "draft"
    active = "active"
    closed = "closed"

class Election(Base):
    __tablename__ = "elections"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status      = Column(Enum(ElectionStatus), default=ElectionStatus.draft, nullable=False)

    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at   = Column(DateTime(timezone=True), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidates    = relationship("Candidate",    back_populates="election", cascade="all, delete")
    vote_receipts = relationship("VoteReceipt",  back_populates="election")