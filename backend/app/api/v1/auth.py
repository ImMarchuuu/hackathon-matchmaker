from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.db import db_dependency
from app.models.auth import AuthResponse, LoginRequest
from app.models.user import UserRegisterRequest
from app.services import auth as auth_service

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
