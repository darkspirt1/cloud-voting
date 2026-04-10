# app/services/election_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List
from datetime import datetime, timezone

from app.models.election  import Election, ElectionStatus
from app.models.candidate import Candidate
from app.schemas.election import ElectionCreate


def create_election(db: Session, payload: ElectionCreate) -> Election:
    """Create an election with its candidates in one transaction."""

    # Validate dates
    if payload.starts_at >= payload.ends_at:
        raise HTTPException(status_code=400, detail="starts_at must be before ends_at")
    if payload.ends_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="ends_at must be in the future")
    if len(payload.candidates) < 2:
        raise HTTPException(status_code=400, detail="An election needs at least 2 candidates")

    # Create election
    election = Election(
        title       = payload.title,
        description = payload.description,
        starts_at   = payload.starts_at,
        ends_at     = payload.ends_at,
        status      = ElectionStatus.draft,
    )
    db.add(election)
    db.flush()  # get election.id without committing yet

    # Create candidates linked to this election
    for c in payload.candidates:
        candidate = Candidate(
            election_id = election.id,
            name        = c.name,
            description = c.description,
        )
        db.add(candidate)

    db.commit()
    db.refresh(election)
    return election


def get_all_elections(db: Session) -> List[Election]:
    return db.query(Election).order_by(Election.created_at.desc()).all()


def get_election_by_id(db: Session, election_id: str) -> Election:
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    return election


def activate_election(db: Session, election_id: str) -> Election:
    election = get_election_by_id(db, election_id)
    if election.status != ElectionStatus.draft:
        raise HTTPException(status_code=400, detail="Only draft elections can be activated")
    election.status = ElectionStatus.active
    db.commit()
    db.refresh(election)
    return election


def close_election(db: Session, election_id: str) -> Election:
    election = get_election_by_id(db, election_id)
    if election.status != ElectionStatus.active:
        raise HTTPException(status_code=400, detail="Only active elections can be closed")
    election.status = ElectionStatus.closed
    db.commit()
    db.refresh(election)
    return election


def get_results(db: Session, election_id: str) -> dict:
    """Return tally results for an election."""
    election = get_election_by_id(db, election_id)

    total_votes = sum(c.vote_count for c in election.candidates)
    candidates  = []

    for c in sorted(election.candidates, key=lambda x: x.vote_count, reverse=True):
        candidates.append({
            "id":         str(c.id),
            "name":       c.name,
            "vote_count": c.vote_count,
            "percentage": round((c.vote_count / total_votes * 100), 2) if total_votes > 0 else 0,
        })

    return {
        "election_id":   str(election.id),
        "title":         election.title,
        "status":        election.status,
        "total_votes":   total_votes,
        "candidates":    candidates,
        "winner":        candidates[0] if election.status == ElectionStatus.closed and total_votes > 0 else None,
    }