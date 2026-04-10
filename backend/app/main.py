# app/main.py  (final version)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, elections, votes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="A secure cloud-based voting system built with FastAPI + AWS",
    version="1.0.0",
)

# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # open for dev — we restrict in production
    allow_credentials=False,   # must be False when allow_origins = ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["Auth"])
app.include_router(
    elections.router, prefix="/api/elections", tags=["Elections"])
app.include_router(votes.router,     prefix="/api/votes",     tags=["Votes"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Voting API is running"}
