# app/models/voter.py
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Voter(Base):
    __tablename__ = "voters"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name       = Column(String(255), nullable=False)

    # Identity verification
    national_id_hash = Column(String(255), unique=True, nullable=True)
    is_verified      = Column(Boolean, default=False)
    is_admin         = Column(Boolean, default=False)
    is_active        = Column(Boolean, default=True)

    # OTP for email verification / MFA
    otp_code         = Column(String(6),   nullable=True)
    otp_expires_at   = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    vote_receipts = relationship("VoteReceipt", back_populates="voter")