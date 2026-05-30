import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.db import db_dependency, redis_dependency
from app.core.security import denylist_token
from app.models.auth import AuthResponse, LoginRequest
from app.models.user import UserRegisterRequest
from app.services import auth as auth_service

_bearer = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=AuthResponse, status_code=201, summary="Register a new user")
async def register(
    payload: UserRegisterRequest,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> AuthResponse:
    return await auth_service.register(db, payload)


@router.post("/login", response_model=AuthResponse, summary="Login with email and password")
async def login(
    payload: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> AuthResponse:
    return await auth_service.login(db, payload.email, payload.password)


@router.post("/logout", status_code=204, summary="Logout — revoke current token")
async def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> None:
    """Add the current JWT to the Redis denylist so it cannot be reused."""
    if credentials:
        await denylist_token(redis, credentials.credentials)
