from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import UserPublicResponse
from app.repositories import user as user_repo


async def list_users(
    db: AsyncIOMotorDatabase,
    *,
    role: str | None = None,
    skill: str | None = None,
) -> list[UserPublicResponse]:
    docs = await user_repo.get_all(db, role=role, skill=skill)
    return [UserPublicResponse.from_document(d) for d in docs]


async def get_user_profile(
    db: AsyncIOMotorDatabase,
    username: str,
) -> UserPublicResponse:
    doc = await user_repo.get_by_username(db, username)
    if not doc:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found")
    return UserPublicResponse.from_document(doc)


async def get_current_user(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> UserPublicResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    doc = await user_repo.get_by_id(db, ObjectId(user_id))
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublicResponse.from_document(doc)
