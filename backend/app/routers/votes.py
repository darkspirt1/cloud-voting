# app/routers/votes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database      import get_db
from app.dependencies  import get_current_voter
from app.services      import vote_service

router = APIRouter()


class CastVotePayload(BaseModel):
    election_id:  str
    candidate_id: str


@router.post("/cast")
def cast_vote(
    payload: CastVotePayload,
    db:      Session = Depends(get_db),
    voter    = Depends(get_current_voter),
):
    return vote_service.cast_vote(
        db           = db,
        voter        = voter,
        election_id  = payload.election_id,
        candidate_id = payload.candidate_id,
    )


@router.get("/my-votes")
def my_votes(
    db:    Session = Depends(get_db),
    voter  = Depends(get_current_voter),
):
    """Returns list of elections this voter has participated in."""
    from app.models.vote import VoteReceipt
    receipts = db.query(VoteReceipt).filter(
        VoteReceipt.voter_id == voter.id
    ).all()
    return [
        {
            "election_id":   str(r.election_id),
            "receipt_token": r.receipt_token,
            "cast_at":       r.cast_at,
        }
        for r in receipts
    ]