# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Cloud Voting System"
    debug: bool = False
    secret_key: str
    database_url: str
    redis_url: str = "redis://localhost:6379"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    email_host: str = "smtp.gmail.com"
    email_port: int = 587
    email_user: str = ""
    email_password: str = ""
    email_from: str = ""
    aws_region: str = "ap-south-1"
    s3_bucket_name: str = ""

    class Config:
        env_file = ".env"

# Single instance used across the whole app
settings = Settings()