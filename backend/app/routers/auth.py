# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.voter import VoterRegister, VoterResponse
from app.services import auth_service
from app.services.email_service import send_otp_email
from pydantic import BaseModel

router = APIRouter()


# ── Register ──────────────────────────────────────────────────────

@router.post("/register", response_model=VoterResponse, status_code=201)
def register(payload: VoterRegister, db: Session = Depends(get_db)):
    existing = auth_service.get_voter_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    voter = auth_service.create_voter(
        db        = db,
        full_name = payload.full_name,
        email     = payload.email,
        password  = payload.password,
    )

    otp = auth_service.set_otp(db, voter)

    # Try sending email — falls back to terminal print if it fails
    try:
        send_otp_email(voter.email, otp, voter.full_name)
    except Exception:
        print("[DEV] Email failed — OTP printed to terminal instead")

    return voter




# ── Verify OTP ────────────────────────────────────────────────────

class OTPVerifyPayload(BaseModel):
    email: str
    otp: str

@router.post("/verify-otp")
def verify_otp(payload: OTPVerifyPayload, db: Session = Depends(get_db)):
    voter = auth_service.get_voter_by_email(db, payload.email)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    if not auth_service.verify_otp(voter, payload.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )

    # Mark verified and clear OTP
    voter.is_verified  = True
    voter.otp_code     = None
    voter.otp_expires_at = None
    db.commit()

    return {"message": "Email verified successfully. You can now log in."}


# ── Resend OTP ────────────────────────────────────────────────────

class ResendOTPPayload(BaseModel):
    email: str

@router.post("/resend-otp")
def resend_otp(payload: ResendOTPPayload, db: Session = Depends(get_db)):
    voter = auth_service.get_voter_by_email(db, payload.email)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    if voter.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")

    otp = auth_service.set_otp(db, voter)
    send_otp_email(voter.email, otp, voter.full_name)
    return {"message": "New OTP sent to your email"}


# ── Login ─────────────────────────────────────────────────────────

@router.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # OAuth2PasswordRequestForm uses 'username' field — we treat it as email
    voter = auth_service.get_voter_by_email(db, form.username)

    if not voter or not auth_service.verify_password(form.password, voter.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not voter.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in"
        )

    if not voter.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    # Issue JWT
    token = auth_service.create_access_token(data={
        "sub":      str(voter.id),
        "email":    voter.email,
        "is_admin": voter.is_admin,
    })

    return {
        "access_token": token,
        "token_type":   "bearer",
        "voter": {
            "id":          str(voter.id),
            "full_name":   voter.full_name,
            "email":       voter.email,
            "is_admin":    voter.is_admin,
            "is_verified": voter.is_verified,
        }
    }


# ── Get current voter profile ─────────────────────────────────────

@router.get("/me", response_model=VoterResponse)
def get_me(
    db: Session = Depends(get_db),
    current_voter = Depends(__import__('app.dependencies', fromlist=['get_current_voter']).get_current_voter)
):
    from app.models.voter import Voter
    voter = db.query(Voter).filter(Voter.id == current_voter["voter_id"]).first()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    return voter