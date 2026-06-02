import uuid
from pathlib import Path

import redis.asyncio as aioredis
from bson import ObjectId
from fastapi import HTTPException, UploadFile
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import AddCompetitionRequest, CompetitionExperience, CompetitionExperienceResponse, FavoriteToggleResponse, UpdateProfileRequest, UserPublicResponse
from app.repositories import user as user_repo
from app.repositories import behavioral_vote as vote_repo
from app.services.rank import rank_for_count, rank_overall_for_entries, recompute_from_competitions

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB
_UPLOADS_ROOT = Path("/app/uploads")


async def delete_account(
    db: AsyncIOMotorDatabase,
    redis: aioredis.Redis,
    user_id: str,
    token: str,
) -> None:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    await user_repo.delete_user(db, ObjectId(user_id))
    from app.core.security import denylist_token
    await denylist_token(redis, token)


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


async def _build_competition_responses(
    db: AsyncIOMotorDatabase,
    user_oid: ObjectId,
    experiences: list[dict],
) -> list[CompetitionExperienceResponse]:
    results = []
    for exp in experiences:
        team_id = exp.get("team_id")
        if exp.get("type") == "team" and team_id and ObjectId.is_valid(team_id):
            vote_count = await vote_repo.count_votes_received_in_team(
                db, user_oid, ObjectId(team_id)
            )
            contributor_count = len(exp.get("contributor_ids", []))
            reviewed = contributor_count == 0 or vote_count >= contributor_count
        else:
            reviewed = True
        results.append(CompetitionExperienceResponse(
            id=exp["id"],
            competition_name=exp["competition_name"],
            detail=exp.get("detail", ""),
            roles=exp.get("roles", []),
            skills=exp.get("skills", []),
            contributor_ids=exp.get("contributor_ids", []),
            type=exp.get("type", "team"),
            team_id=team_id,
            date=exp.get("date"),
            github_url=exp.get("github_url"),
            reviewed=reviewed,
        ))
    return results


async def get_competitions(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> list[CompetitionExperienceResponse]:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    oid = ObjectId(user_id)
    doc = await user_repo.get_by_id(db, oid)
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    experiences = doc.get("competition_experiences", [])
    return await _build_competition_responses(db, oid, experiences)


async def add_competition(
    db: AsyncIOMotorDatabase,
    redis: aioredis.Redis,
    user_id: str,
    payload: AddCompetitionRequest,
) -> list[CompetitionExperienceResponse]:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    oid = ObjectId(user_id)
    entry = CompetitionExperience(**payload.model_dump()).model_dump()
    doc = await user_repo.add_competition(db, oid, entry)
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    await recompute_from_competitions(db, redis, oid)
    updated = await user_repo.get_by_id(db, oid)
    return await _build_competition_responses(db, oid, updated.get("competition_experiences", []))


async def update_competition(
    db: AsyncIOMotorDatabase,
    redis: aioredis.Redis,
    user_id: str,
    comp_id: str,
    payload: AddCompetitionRequest,
) -> list[CompetitionExperienceResponse]:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    oid = ObjectId(user_id)
    entry = {**CompetitionExperience(**payload.model_dump()).model_dump(), "id": comp_id}
    doc = await user_repo.update_competition(db, oid, comp_id, entry)
    if not doc:
        raise HTTPException(status_code=404, detail="Competition entry not found")
    await recompute_from_competitions(db, redis, oid)
    updated = await user_repo.get_by_id(db, oid)
    return await _build_competition_responses(db, oid, updated.get("competition_experiences", []))


async def remove_competition(
    db: AsyncIOMotorDatabase,
    redis: aioredis.Redis,
    user_id: str,
    comp_id: str,
) -> list[CompetitionExperienceResponse]:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    oid = ObjectId(user_id)
    doc = await user_repo.remove_competition(db, oid, comp_id)
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    await recompute_from_competitions(db, redis, oid)
    updated = await user_repo.get_by_id(db, oid)
    return await _build_competition_responses(db, oid, updated.get("competition_experiences", []))


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
