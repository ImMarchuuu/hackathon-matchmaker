from motor.motor_asyncio import AsyncIOMotorDatabase


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
