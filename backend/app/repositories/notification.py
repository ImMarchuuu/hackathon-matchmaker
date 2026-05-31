from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def create(
    db: AsyncIOMotorDatabase,
    user_id: ObjectId,
    type_: str,
    payload: dict,
) -> None:
    await db["notifications"].insert_one({
        "user_id": user_id,
        "type": type_,
        "payload": payload,
        "read": False,
        "created_at": datetime.now(timezone.utc),
    })


async def get_for_user(
    db: AsyncIOMotorDatabase,
    user_id: ObjectId,
    limit: int = 20,
) -> list[dict]:
    cursor = db["notifications"].find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit)
    return await cursor.to_list(length=None)


async def mark_all_read(db: AsyncIOMotorDatabase, user_id: ObjectId) -> None:
    await db["notifications"].update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}},
    )
