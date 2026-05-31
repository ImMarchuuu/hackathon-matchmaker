import uuid
from datetime import datetime, timedelta, timezone

import redis.asyncio as aioredis
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_DENYLIST_PREFIX = "denylist:"


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expires_minutes)
    return jwt.encode(
        {"sub": user_id, "exp": expire, "jti": uuid.uuid4().hex},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> str:
    """Return user_id string. Raises JWTError if invalid or expired."""
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    return payload["sub"]


def decode_access_token_full(token: str) -> dict:
    """Return full payload dict. Raises JWTError if invalid or expired."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


async def denylist_token(redis: aioredis.Redis, token: str) -> None:
    """Add token's JTI to the Redis denylist with TTL = remaining token lifetime."""
    try:
        payload = decode_access_token_full(token)
    except JWTError:
        return  # already invalid — nothing to denylist

    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not exp:
        return

    ttl = max(0, int(exp - datetime.now(timezone.utc).timestamp()))
    if ttl > 0:
        await redis.set(f"{_DENYLIST_PREFIX}{jti}", "1", ex=ttl)


async def is_denylisted(redis: aioredis.Redis, token: str) -> bool:
    """Return True if the token's JTI is in the denylist."""
    try:
        payload = decode_access_token_full(token)
    except JWTError:
        return False

    jti = payload.get("jti")
    if not jti:
        return False

    return await redis.exists(f"{_DENYLIST_PREFIX}{jti}") > 0
