# app/models/vote.py
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Ballot(Base):
    """Stores the actual vote — anonymous, no voter identity here."""
    __tablename__ = "ballots"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    election_id   = Column(UUID(as_uuid=True), ForeignKey("elections.id"), nullable=False)
    candidate_id  = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)

    # Receipt token given to voter — links to vote_receipts without exposing identity
    receipt_token = Column(String(255), unique=True, nullable=False)
    cast_at       = Column(DateTime(timezone=True), server_default=func.now())

    candidate = relationship("Candidate", back_populates="ballots")


class VoteReceipt(Base):
    """Proves a voter participated — no candidate info stored here."""
    __tablename__ = "vote_receipts"

    voter_id      = Column(UUID(as_uuid=True), ForeignKey("voters.id"),    primary_key=True)
    election_id   = Column(UUID(as_uuid=True), ForeignKey("elections.id"), primary_key=True)
    receipt_token = Column(String(255), nullable=False)  # matches Ballot.receipt_token
    cast_at       = Column(DateTime(timezone=True), server_default=func.now())

    voter    = relationship("Voter",    back_populates="vote_receipts")
    election = relationship("Election", back_populates="vote_receipts")