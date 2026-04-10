# app/services/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_otp_email(to_email: str, otp: str, voter_name: str):
    """Send a nicely formatted OTP email to the voter."""

    subject = "Your Voting System Verification Code"
    body = f"""
    Hi {voter_name},

    Your one-time verification code is:

        {otp}

    This code expires in 10 minutes.
    Do not share it with anyone.

    If you did not request this, please ignore this email.

    — Cloud Voting System
    """

    msg = MIMEMultipart()
    msg["From"]    = settings.email_from
    msg["To"]      = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.email_host, settings.email_port) as server:
            server.starttls()
            server.login(settings.email_user, settings.email_password)
            server.sendmail(settings.email_from, to_email, msg.as_string())
    except Exception as e:
        # In production, log this properly — don't silently swallow errors
        print(f"Email send failed: {e}")
        raise