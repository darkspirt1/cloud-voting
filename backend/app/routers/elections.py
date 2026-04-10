# app/routers/elections.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database            import get_db
from app.dependencies        import get_current_voter, get_current_admin
from app.schemas.election    import ElectionCreate, ElectionResponse
from app.services            import election_service

router = APIRouter()


@router.post("/", response_model=ElectionResponse, status_code=201)
def create_election(
    payload: ElectionCreate,
    db:      Session = Depends(get_db),
    admin    = Depends(get_current_admin),   # admin only
):
    return election_service.create_election(db, payload)


@router.get("/", response_model=List[ElectionResponse])
def list_elections(
    db:     Session = Depends(get_db),
    voter   = Depends(get_current_voter),    # any logged-in voter
):
    return election_service.get_all_elections(db)


@router.get("/{election_id}", response_model=ElectionResponse)
def get_election(
    election_id: str,
    db:          Session = Depends(get_db),
    voter        = Depends(get_current_voter),
):
    return election_service.get_election_by_id(db, election_id)


@router.patch("/{election_id}/activate", response_model=ElectionResponse)
def activate(
    election_id: str,
    db:          Session = Depends(get_db),
    admin        = Depends(get_current_admin),
):
    return election_service.activate_election(db, election_id)


@router.patch("/{election_id}/close", response_model=ElectionResponse)
def close(
    election_id: str,
    db:          Session = Depends(get_db),
    admin        = Depends(get_current_admin),
):
    return election_service.close_election(db, election_id)


@router.get("/{election_id}/results")
def results(
    election_id: str,
    db:          Session = Depends(get_db),
    voter        = Depends(get_current_voter),
):
    return election_service.get_results(db, election_id)