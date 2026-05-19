from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

_SAFE_PROJECTION = {"password_hash": 0, "oauth_accounts": 0}


async def get_all(
    db: AsyncIOMotorDatabase,
    *,
    role: str | None = None,
    skill: str | None = None,
) -> list[dict]:
    query: dict = {}
    if role:
        query["role.name"] = role
    if skill:
        query["skills.name"] = skill
    cursor = db["users"].find(query, _SAFE_PROJECTION)
    return await cursor.to_list(length=None)


async def get_by_username(db: AsyncIOMotorDatabase, username: str) -> dict | None:
    return await db["users"].find_one({"username": username}, _SAFE_PROJECTION)


async def get_by_id(db: AsyncIOMotorDatabase, user_id: ObjectId) -> dict | None:
    return await db["users"].find_one({"_id": user_id}, _SAFE_PROJECTION)


async def get_by_ids(db: AsyncIOMotorDatabase, user_ids: list[ObjectId]) -> list[dict]:
    cursor = db["users"].find({"_id": {"$in": user_ids}}, _SAFE_PROJECTION)
    return await cursor.to_list(length=None)
