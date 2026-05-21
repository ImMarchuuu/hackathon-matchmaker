from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import UpdateProfileRequest, UserPublicResponse
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


async def update_profile(
    db: AsyncIOMotorDatabase,
    user_id: str,
    payload: UpdateProfileRequest,
) -> UserPublicResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")

    oid = ObjectId(user_id)

    # Build $set fields from non-None values (exclude roles — handled separately)
    fields: dict = {
        k: v
        for k, v in payload.model_dump(exclude={"roles"}).items()
        if v is not None
    }

    # Merge roles: preserve earned tier/count for existing ones, add new at Bronze
    if payload.roles is not None:
        current = await user_repo.get_by_id(db, oid)
        if not current:
            raise HTTPException(status_code=404, detail="User not found")

        existing = {r["name"]: r for r in current.get("role", [])}
        merged = []
        for role_name in payload.roles:
            if role_name in existing:
                merged.append(existing[role_name])
            else:
                merged.append({
                    "name": role_name,
                    "tier": 1,
                    "project_count": 0,
                    "rank_title": "Bronze",
                })
        fields["role"] = merged

    doc = await user_repo.update_profile(db, oid, fields)
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublicResponse.from_document(doc)
