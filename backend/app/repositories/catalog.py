import re
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import UpdateOne


async def search_skills(
    db: AsyncIOMotorDatabase,
    q: str,
    limit: int = 10,
) -> list[str]:
    """Prefix-match skill names from skill_catalog, case-insensitive."""
    pattern = re.compile(f"^{re.escape(q)}", re.IGNORECASE)
    cursor = (
        db["skill_catalog"]
        .find({"name": {"$regex": pattern}}, {"_id": 0, "name": 1})
        .sort("name", 1)
        .limit(limit)
    )
    return [doc["name"] async for doc in cursor]


async def upsert_skills(db: AsyncIOMotorDatabase, names: list[str]) -> None:
    """Insert skill names that don't exist yet; ignore duplicates."""
    if not names:
        return
    now = datetime.utcnow()
    ops = [
        UpdateOne(
            {"name": name},
            {"$setOnInsert": {"name": name, "created_at": now}},
            upsert=True,
        )
        for name in names
        if name.strip()
    ]
    if ops:
        await db["skill_catalog"].bulk_write(ops, ordered=False)


async def get_role_counts(db: AsyncIOMotorDatabase) -> dict[str, int]:
    """Return {role_name: user_count} for every role that appears in the users collection."""
    pipeline = [
        {"$unwind": "$role"},
        {"$group": {"_id": "$role.name", "count": {"$sum": 1}}},
    ]
    cursor = db["users"].aggregate(pipeline)
    return {doc["_id"]: doc["count"] async for doc in cursor}


async def get_all_skills(db: AsyncIOMotorDatabase) -> list[dict]:
    """Return [{name, user_count}] for every distinct skill, sorted by popularity."""
    pipeline = [
        {"$unwind": "$skills"},
        {"$group": {"_id": "$skills.name", "user_count": {"$sum": 1}}},
        {"$project": {"_id": 0, "name": "$_id", "user_count": 1}},
        {"$sort": {"user_count": -1, "name": 1}},
    ]
    cursor = db["users"].aggregate(pipeline)
    return [doc async for doc in cursor]
