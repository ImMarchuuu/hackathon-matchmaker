from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException

from app.core.security import create_access_token, hash_password, verify_password
from app.models.auth import AuthResponse, AuthUserInfo
from app.models.user import UserRegisterRequest
from app.repositories import user as user_repo
from motor.motor_asyncio import AsyncIOMotorDatabase


async def register(db: AsyncIOMotorDatabase, payload: UserRegisterRequest) -> AuthResponse:
    if await user_repo.get_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Email already registered")

    if await user_repo.get_by_username(db, payload.username):
        raise HTTPException(status_code=409, detail="Username already taken")

    user_id = ObjectId()
    doc = {
        "_id": user_id,
        "username": payload.username,
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "avatar_url": None,
        "cover_image": None,
        "bio": None,
        "university": None,
        "birth_date": None,
        "github": None,
        "linkedin": None,
        "mbti": None,
        "behavioral_rates": 0.0,
        "rank_overall": "Bronze",
        "role": [],
        "skills": [],
        "portfolios": [],
        "oauth_accounts": [],
        "created_at": datetime.now(timezone.utc),
    }
    await user_repo.create(db, doc)

    return AuthResponse(
        token=create_access_token(str(user_id)),
        user=AuthUserInfo(
            id=str(user_id),
            displayName=payload.name,
            email=payload.email,
            avatarUrl=None,
        ),
    )


async def login(db: AsyncIOMotorDatabase, email: str, password: str) -> AuthResponse:
    user = await user_repo.get_by_email(db, email)

    if not user or not user.get("password_hash") or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        token=create_access_token(str(user["_id"])),
        user=AuthUserInfo(
            id=str(user["_id"]),
            displayName=user["name"],
            email=user["email"],
            avatarUrl=user.get("avatar_url"),
        ),
    )
