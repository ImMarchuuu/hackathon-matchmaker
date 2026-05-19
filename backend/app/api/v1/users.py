from typing import Optional

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.db import db_dependency
from app.models.user import RoleName, UserPublicResponse
from app.services import user as user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserPublicResponse], summary="List users")
async def list_users(
    role: Optional[RoleName] = None,
    skill: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[UserPublicResponse]:
    """Return all users, optionally filtered by role or skill name."""
    return await user_service.list_users(db, role=role, skill=skill)


@router.get("/{username}", response_model=UserPublicResponse, summary="Get user profile")
async def get_user(
    username: str,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> UserPublicResponse:
    """Return public profile for a given username."""
    return await user_service.get_user_profile(db, username)
