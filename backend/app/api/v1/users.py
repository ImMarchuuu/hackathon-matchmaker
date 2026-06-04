from typing import Optional

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.db import db_dependency, redis_dependency
from app.core.deps import get_current_user_id
from app.models.team import TeamResponse
from app.models.user import AddCompetitionRequest, CompetitionExperienceResponse, FavoriteToggleResponse, RankSummaryResponse, RoleName, UpdateProfileRequest, UserPublicResponse
from app.services import team as team_service
from app.services import user as user_service
from app.services.rank import get_rank_summary

router = APIRouter(prefix="/users", tags=["Users"])
_bearer = HTTPBearer(auto_error=False)


@router.get("/me", response_model=UserPublicResponse, summary="Get current user profile")
async def get_me(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> UserPublicResponse:
    """Return the profile of the currently authenticated user."""
    return await user_service.get_current_user(db, current_user_id)


@router.delete("/me", status_code=204, summary="Delete current user account")
async def delete_me(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> None:
    """Permanently delete the authenticated user's account and revoke their token."""
    token = credentials.credentials if credentials else ""
    await user_service.delete_account(db, redis, current_user_id, token)


@router.put("/me", response_model=UserPublicResponse, summary="Update current user profile")
async def update_me(
    payload: UpdateProfileRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> UserPublicResponse:
    """Update mutable profile fields for the currently authenticated user."""
    return await user_service.update_profile(db, current_user_id, payload, redis)


@router.post("/me/avatar", response_model=UserPublicResponse, summary="Upload profile avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> UserPublicResponse:
    """Replace the current user's avatar. Accepts JPEG, PNG, WebP, GIF up to 5 MB."""
    return await user_service.upload_avatar(db, current_user_id, file)


@router.post("/me/cover", response_model=UserPublicResponse, summary="Upload cover image")
async def upload_cover(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> UserPublicResponse:
    """Replace the current user's cover image. Accepts JPEG, PNG, WebP, GIF up to 5 MB."""
    return await user_service.upload_cover(db, current_user_id, file)


@router.post("/me/recompute-ranks", response_model=UserPublicResponse, summary="Recompute role/skill ranks from competition history")
async def recompute_ranks(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> UserPublicResponse:
    """Force-recompute role and skill ranks from the current competition history."""
    from bson import ObjectId as BsonObjectId
    from app.services.rank import recompute_from_competitions
    if not BsonObjectId.is_valid(current_user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")
    oid = BsonObjectId(current_user_id)
    await recompute_from_competitions(db, redis, oid)
    doc = await user_service.get_current_user(db, current_user_id)
    return doc


@router.get("/me/competitions", response_model=list[CompetitionExperienceResponse], summary="Get current user's competition history")
async def get_my_competitions(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[CompetitionExperienceResponse]:
    """Return all competition/project entries with reviewed status computed from behavioral_votes."""
    return await user_service.get_competitions(db, current_user_id)


@router.post("/me/competitions", response_model=list[CompetitionExperienceResponse], status_code=201, summary="Add a competition experience")
async def add_competition(
    payload: AddCompetitionRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> list[CompetitionExperienceResponse]:
    """Append a competition experience, recompute ranks, return updated list."""
    return await user_service.add_competition(db, redis, current_user_id, payload)


@router.put("/me/competitions/{comp_id}", response_model=list[CompetitionExperienceResponse], summary="Update a competition experience")
async def update_competition(
    comp_id: str,
    payload: AddCompetitionRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> list[CompetitionExperienceResponse]:
    """Replace a competition experience entry, recompute ranks, return updated list."""
    return await user_service.update_competition(db, redis, current_user_id, comp_id, payload)


@router.delete("/me/competitions/{comp_id}", response_model=list[CompetitionExperienceResponse], summary="Remove a competition experience")
async def remove_competition(
    comp_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> list[CompetitionExperienceResponse]:
    """Remove a competition experience entry, recompute ranks, return updated list."""
    return await user_service.remove_competition(db, redis, current_user_id, comp_id)


@router.get("/{user_id}/competitions", response_model=list[CompetitionExperienceResponse], summary="Get a user's competition history")
async def get_user_competitions(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[CompetitionExperienceResponse]:
    """Return competition/project entries for a given user (public)."""
    return await user_service.get_competitions(db, user_id)


@router.get("/me/favorites", response_model=list[UserPublicResponse], summary="Get current user's favorite people")
async def get_my_favorites(
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[UserPublicResponse]:
    """Return all users that the current user has favorited."""
    return await user_service.get_favorites(db, current_user_id)


@router.get("", summary="List / search users (paginated)")
async def list_users(
    role: Optional[RoleName] = None,
    skill: Optional[str] = None,
    q: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> dict:
    """Return paginated users. Pass `q` for full-text search across name, username, bio and skills."""
    limit = min(limit, 100)
    return await user_service.list_users(db, role=role, skill=skill, q=q, page=page, limit=limit)


@router.get("/{user_id}/teams", response_model=list[TeamResponse], summary="Get teams a user is a member of")
async def get_user_teams(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[TeamResponse]:
    """Return all teams where user_id appears in member_ids, newest first."""
    return await team_service.get_user_teams(db, user_id)


@router.delete("/{user_id}/favorite", status_code=204, summary="Remove a user from favorites")
async def remove_favorite(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> None:
    """Remove user_id from current user's favorites. Idempotent — no error if not saved."""
    await user_service.remove_favorite(db, current_user_id, user_id)


@router.get("/{user_id}/rank-summary", response_model=RankSummaryResponse, summary="Get skill & role rank summary")
async def get_user_rank_summary(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> RankSummaryResponse:
    """
    Return live-computed rank data for the given user:
    skill ranks with within-tier progress, role ranks, overall rank,
    and behavioral_rates (soft skill score).
    Thresholds are read from Redis so changes take effect without redeployment.
    """
    data = await get_rank_summary(db, redis, user_id)
    return RankSummaryResponse(**data)


@router.post("/{user_id}/favorite", response_model=FavoriteToggleResponse, summary="Toggle favorite on a user")
async def toggle_favorite(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> FavoriteToggleResponse:
    """Toggle user_id in the current user's favorites. Returns favorited=true if now saved."""
    return await user_service.toggle_favorite(db, current_user_id, user_id)


@router.get("/{username}", response_model=UserPublicResponse, summary="Get user profile by username")
async def get_user(
    username: str,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> UserPublicResponse:
    """Return public profile for a given username."""
    return await user_service.get_user_profile(db, username)
