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


async def get_by_email(db: AsyncIOMotorDatabase, email: str) -> dict | None:
    """Includes password_hash — only use for auth checks."""
    return await db["users"].find_one({"email": email})


async def create(db: AsyncIOMotorDatabase, doc: dict) -> None:
    await db["users"].insert_one(doc)


async def update_image(
    db: AsyncIOMotorDatabase,
    user_id: ObjectId,
    field: str,
    url: str,
) -> dict | None:
    from pymongo import ReturnDocument
    return await db["users"].find_one_and_update(
        {"_id": user_id},
        {"$set": {field: url}},
        return_document=ReturnDocument.AFTER,
        projection=_SAFE_PROJECTION,
    )


async def update_profile(
    db: AsyncIOMotorDatabase,
    user_id: ObjectId,
    fields: dict,
) -> dict | None:
    """Apply $set patch and return the updated document (safe projection)."""
    from pymongo import ReturnDocument
    return await db["users"].find_one_and_update(
        {"_id": user_id},
        {"$set": fields},
        return_document=ReturnDocument.AFTER,
        projection=_SAFE_PROJECTION,
    )
