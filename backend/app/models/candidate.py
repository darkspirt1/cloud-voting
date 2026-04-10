# app/models/candidate.py
import uuid
from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    election_id = Column(UUID(as_uuid=True), ForeignKey("elections.id", ondelete="CASCADE"), nullable=False)
    name        = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    vote_count  = Column(Integer, default=0, nullable=False)

    # Relationships
    election = relationship("Election", back_populates="candidates")
    ballots  = relationship("Ballot",   back_populates="candidate")