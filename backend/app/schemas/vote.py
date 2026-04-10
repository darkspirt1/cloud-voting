# app/schemas/vote.py
from pydantic import BaseModel, UUID4
from datetime import datetime

class CastVote(BaseModel):
    """What the frontend sends when a voter submits their ballot."""
    election_id: UUID4
    candidate_id: UUID4

class VoteReceiptResponse(BaseModel):
    """Confirmation sent back after a successful vote."""
    receipt_token: str
    election_id: UUID4
    cast_at: datetime
    message: str = "Your vote has been recorded successfully"