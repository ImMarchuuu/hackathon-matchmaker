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


async def delete_all_for_user(db: AsyncIOMotorDatabase, user_id: ObjectId) -> None:
    await db["notifications"].delete_many({"user_id": user_id})


async def stamp_request_resolved(
    db: AsyncIOMotorDatabase,
    leader_id: ObjectId,
    request_id: str,
    resolved_status: str,
) -> None:
    """Set payload.resolved_status on the leader's join_request notification."""
    await db["notifications"].update_one(
        {
            "user_id": leader_id,
            "type": "join_request",
            "payload.request_id": request_id,
        },
        {"$set": {"payload.resolved_status": resolved_status}},
    )
