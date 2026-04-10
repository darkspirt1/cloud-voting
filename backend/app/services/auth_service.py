# app/services/auth_service.py
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.models.voter import Voter

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password helpers ──────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── OTP helpers ───────────────────────────────────────────────────

def generate_otp() -> str:
    """Generate a random 6-digit OTP code."""
    return "".join(random.choices(string.digits, k=6))

def set_otp(db: Session, voter: Voter) -> str:
    otp = generate_otp()
    voter.otp_code       = otp
    voter.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()
    print(f"\n{'='*40}")
    print(f"  DEV OTP for {voter.email}: {otp}")
    print(f"{'='*40}\n")
    return otp

def verify_otp(voter: Voter, otp: str) -> bool:
    """Return True only if OTP matches and hasn't expired."""
    if voter.otp_code != otp:
        return False
    if voter.otp_expires_at < datetime.now(timezone.utc):
        return False
    return True


# ── JWT helpers ───────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    expire  = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


# ── Voter DB helpers ──────────────────────────────────────────────

def get_voter_by_email(db: Session, email: str) -> Optional[Voter]:
    return db.query(Voter).filter(Voter.email == email).first()

def create_voter(db: Session, full_name: str, email: str, password: str) -> Voter:
    voter = Voter(
        full_name       = full_name,
        email           = email,
        hashed_password = hash_password(password),
    )
    db.add(voter)
    db.commit()
    db.refresh(voter)
    return voter