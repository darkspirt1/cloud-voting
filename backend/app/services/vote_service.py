# app/services/vote_service.py
import uuid
import redis
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.config           import settings
from app.models.election  import Election, ElectionStatus
from app.models.candidate import Candidate
from app.models.vote      import Ballot, VoteReceipt
from app.models.voter     import Voter

# Try to connect to Redis — if it fails, we fall back to DB-only check
try:
    redis_client = redis.from_url(settings.redis_url, decode_responses=True)
    redis_client.ping()
    REDIS_AVAILABLE = True
    print("[INFO] Redis connected successfully")
except Exception:
    redis_client    = None
    REDIS_AVAILABLE = False
    print("[WARN] Redis not available — using DB-only double-vote check")


def cast_vote(db: Session, voter: Voter, election_id: str, candidate_id: str) -> dict:

    # ── 1. Load & validate election ───────────────────────────────
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    if election.status != ElectionStatus.active:
        raise HTTPException(status_code=400, detail="This election is not currently active")

    now = datetime.now(timezone.utc)
    if now < election.starts_at:
        raise HTTPException(status_code=400, detail="Election has not started yet")
    if now > election.ends_at:
        raise HTTPException(status_code=400, detail="Election has already ended")

    # ── 2. Validate candidate belongs to this election ────────────
    candidate = db.query(Candidate).filter(
        Candidate.id          == candidate_id,
        Candidate.election_id == election_id,
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in this election")

    # ── 3. DB double-vote check (always runs) ─────────────────────
    existing_receipt = db.query(VoteReceipt).filter(
        VoteReceipt.voter_id    == voter.id,
        VoteReceipt.election_id == election_id,
    ).first()
    if existing_receipt:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already voted in this election"
        )

    # ── 4. Redis lock (runs only if Redis is available) ───────────
    lock_key = f"vote_lock:{voter.id}:{election_id}"
    if REDIS_AVAILABLE:
        already_locked = not redis_client.set(lock_key, "1", nx=True, ex=60 * 60 * 24 * 7)
        if already_locked:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already voted in this election"
            )

    # ── 5. Save ballot (anonymous) ────────────────────────────────
    receipt_token = str(uuid.uuid4())

    ballot = Ballot(
        election_id   = election_id,
        candidate_id  = candidate_id,
        receipt_token = receipt_token,
    )
    db.add(ballot)

    # ── 6. Save vote receipt ──────────────────────────────────────
    receipt = VoteReceipt(
        voter_id      = voter.id,
        election_id   = election_id,
        receipt_token = receipt_token,
    )
    db.add(receipt)

    # ── 7. Increment candidate vote count ─────────────────────────
    candidate.vote_count += 1
    db.commit()

    return {
        "message":       "Your vote has been recorded successfully",
        "receipt_token": receipt_token,
        "election":      election.title,
        "candidate":     candidate.name,
        "cast_at":       ballot.cast_at,
    }