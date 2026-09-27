"""
auth_utils.py

Uses Python's built-in hashlib (PBKDF2-HMAC-SHA256) for password hashing
instead of passlib+bcrypt. This is a deliberate, simple choice: the
passlib/bcrypt combo is a very common source of install/version errors
("password cannot be longer than 72 bytes", bcrypt backend mismatches,
etc.) which the project brief explicitly asked to avoid. PBKDF2 is a
well-regarded, standards-based (NIST-approved) algorithm and needs no
extra native dependency beyond Python's stdlib.

JWT is handled with PyJWT, which is lightweight and reliable.
"""
import os
import hashlib
import hmac
import base64
import secrets
from datetime import datetime, timedelta, timezone

import jwt  # PyJWT

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-this-in-.env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

PBKDF2_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algo, iterations, salt_b64, hash_b64 = stored_hash.split("$")
        iterations = int(iterations)
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
    except (ValueError, AttributeError):
        return False

    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(dk, expected)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
