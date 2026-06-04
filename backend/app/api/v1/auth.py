import re
import uuid

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.db import db_dependency, redis_dependency
from app.core.oauth import oauth
from app.core.security import create_access_token, denylist_token
from app.models.auth import AuthResponse, LoginRequest
from app.models.user import UserRegisterRequest
from app.repositories import user as user_repo
from app.services import auth as auth_service

_bearer = HTTPBearer(auto_error=False)
_SUPPORTED_PROVIDERS = {"google", "facebook"}

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


# ── OAuth2 ────────────────────────────────────────────────────────────────────

def _make_username(base: str) -> str:
    """Derive a safe username slug from an email prefix or name."""
    slug = re.sub(r"[^a-z0-9]", "", base.lower())
    return slug[:30] or "user"


async def _ensure_unique_username(db: AsyncIOMotorDatabase, base: str) -> str:
    candidate = _make_username(base)
    suffix = 0
    while await user_repo.get_by_username(db, candidate):
        suffix += 1
        candidate = f"{_make_username(base)}{suffix}"
    return candidate


async def _upsert_oauth_user(
    db: AsyncIOMotorDatabase,
    provider: str,
    provider_id: str,
    email: str,
    name: str,
    avatar_url: str | None,
) -> str:
    """Return user_id (str). Creates or links the OAuth account."""
    from datetime import datetime, timezone
    from bson import ObjectId

    existing = await user_repo.get_by_email(db, email)

    if existing:
        push_ops: dict = {}
        set_ops: dict = {}

        already_linked = any(
            a.get("provider") == provider for a in existing.get("oauth_accounts", [])
        )
        if not already_linked:
            push_ops["oauth_accounts"] = {"provider": provider, "provider_id": provider_id}

        # Fill in missing avatar / name from the OAuth provider
        if avatar_url and not existing.get("avatar_url"):
            set_ops["avatar_url"] = avatar_url
        if name and not existing.get("name"):
            set_ops["name"] = name

        update: dict = {}
        if push_ops:
            update["$push"] = push_ops
        if set_ops:
            update["$set"] = set_ops
        if update:
            await db["users"].update_one({"_id": existing["_id"]}, update)

        return str(existing["_id"])

    # New user — create account
    username = await _ensure_unique_username(db, email.split("@")[0])
    user_id = ObjectId()
    await db["users"].insert_one({
        "_id": user_id,
        "username": username,
        "name": name,
        "email": email,
        "password_hash": None,
        "avatar_url": avatar_url,
        "cover_image": None,
        "bio": None,
        "university": None,
        "birth_date": None,
        "github": None,
        "linkedin": None,
        "mbti": None,
        "onboarding_completed": False,
        "behavioral_rates": 0.0,
        "rank_overall": "Bronze",
        "role": [],
        "skills": [],
        "portfolios": [],
        "competition_experiences": [],
        "oauth_accounts": [{"provider": provider, "provider_id": provider_id}],
        "created_at": datetime.now(timezone.utc),
    })
    return str(user_id)


@router.get("/oauth/{provider}", summary="Redirect to OAuth provider consent screen")
async def oauth_redirect(provider: str, request: Request) -> RedirectResponse:
    if provider not in _SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=400, detail=f"Provider '{provider}' is not configured")
    redirect_uri = f"{settings.oauth_redirect_base_url}/api/v1/auth/oauth/{provider}/callback"
    return await client.authorize_redirect(request, redirect_uri)


@router.get("/oauth/{provider}/callback", summary="OAuth2 callback — exchange code for JWT")
async def oauth_callback(
    provider: str,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> RedirectResponse:
    if provider not in _SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    client = oauth.create_client(provider)
    if not client:
        raise HTTPException(status_code=400, detail=f"Provider '{provider}' is not configured")

    try:
        token = await client.authorize_access_token(request)
    except Exception:
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

    # ── Extract user info ──────────────────────────────────────────────────────
    if provider == "google":
        info = token.get("userinfo") or await client.userinfo(token=token)
        email      = info.get("email")
        name       = info.get("name", "")
        avatar_url = info.get("picture")
        provider_id = info.get("sub")
    elif provider == "facebook":
        resp = await client.get("me?fields=id,name,email,picture", token=token)
        info = resp.json()
        email       = info.get("email")
        name        = info.get("name", "")
        avatar_url  = info.get("picture", {}).get("data", {}).get("url")
        provider_id = info.get("id")

    if not email:
        return RedirectResponse(f"{settings.frontend_url}/login?error=no_email")

    user_id = await _upsert_oauth_user(db, provider, provider_id, email, name, avatar_url)
    jwt = create_access_token(user_id)

    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={jwt}")
