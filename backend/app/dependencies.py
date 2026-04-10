# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.voter import Voter

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_voter(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> dict:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload  = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        voter_id = payload.get("sub")
        if voter_id is None:
            raise credentials_error
    except JWTError:
        raise credentials_error

    voter = db.query(Voter).filter(Voter.id == voter_id).first()
    if not voter or not voter.is_active:
        raise credentials_error
    return voter


def get_current_admin(current_voter: Voter = Depends(get_current_voter)) -> Voter:
    """Use this dependency on admin-only routes."""
    if not current_voter.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_voter