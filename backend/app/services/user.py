import uuid
from pathlib import Path

import redis.asyncio as aioredis
from bson import ObjectId
from fastapi import HTTPException, UploadFile
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import FavoriteToggleResponse, UpdateProfileRequest, UserPublicResponse
from app.repositories import user as user_repo
from app.services.rank import rank_for_count, rank_overall_for_entries

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
_UPLOADS_ROOT = Path("/app/uploads")


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
    redis: aioredis.Redis | None = None,
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
                # New role — compute rank from 0 projects via shared calculator
                rank = (
                    await rank_for_count(redis, 0)
                    if redis
                    else {"tier": 1, "rank_title": "Bronze"}
                )
                merged.append({
                    "name": role_name,
                    "project_count": 0,
                    "tier": rank["tier"],
                    "rank_title": rank["rank_title"],
                })
        fields["role"] = merged

        # Recompute rank_overall from all roles
        if redis:
            fields["rank_overall"] = await rank_overall_for_entries(redis, merged)

    doc = await user_repo.update_profile(db, oid, fields)
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublicResponse.from_document(doc)


async def toggle_favorite(
    db: AsyncIOMotorDatabase,
    me_id: str,
    target_id: str,
) -> FavoriteToggleResponse:
    if not ObjectId.is_valid(me_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    if not ObjectId.is_valid(target_id):
        raise HTTPException(status_code=422, detail="Invalid user ID format")

    me_oid = ObjectId(me_id)
    target_oid = ObjectId(target_id)

    if me_oid == target_oid:
        raise HTTPException(status_code=422, detail="Cannot favorite yourself")

    target = await user_repo.get_by_id(db, target_oid)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    favorited = await user_repo.toggle_favorite(db, me_oid, target_oid)
    return FavoriteToggleResponse(target_id=target_id, favorited=favorited)


async def remove_favorite(
    db: AsyncIOMotorDatabase,
    me_id: str,
    target_id: str,
) -> None:
    if not ObjectId.is_valid(me_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    if not ObjectId.is_valid(target_id):
        raise HTTPException(status_code=422, detail="Invalid user ID format")
    await user_repo.remove_favorite(db, ObjectId(me_id), ObjectId(target_id))


async def get_favorites(
    db: AsyncIOMotorDatabase,
    me_id: str,
) -> list[UserPublicResponse]:
    if not ObjectId.is_valid(me_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    docs = await user_repo.get_favorites(db, ObjectId(me_id))
    return [UserPublicResponse.from_document(d) for d in docs]


async def _save_upload(file: UploadFile, subfolder: str) -> str:
    if file.content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, WebP, or GIF images are allowed")

    data = await file.read()
    if len(data) > _MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be smaller than 5 MB")

    ext = (file.filename or "").rsplit(".", 1)[-1].lower() or "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    dest = _UPLOADS_ROOT / subfolder
    dest.mkdir(parents=True, exist_ok=True)
    (dest / filename).write_bytes(data)
    return f"/uploads/{subfolder}/{filename}"


async def upload_avatar(
    db: AsyncIOMotorDatabase,
    user_id: str,
    file: UploadFile,
) -> UserPublicResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    url = await _save_upload(file, "avatars")
    doc = await user_repo.update_image(db, ObjectId(user_id), "avatar_url", url)
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublicResponse.from_document(doc)


async def upload_cover(
    db: AsyncIOMotorDatabase,
    user_id: str,
    file: UploadFile,
) -> UserPublicResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    url = await _save_upload(file, "covers")
    doc = await user_repo.update_image(db, ObjectId(user_id), "cover_image", url)
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublicResponse.from_document(doc)
