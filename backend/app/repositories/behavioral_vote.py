from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def has_voted(
    db: AsyncIOMotorDatabase,
    voter_id: ObjectId,
    target_id: ObjectId,
    team_id: ObjectId,
) -> bool:
    doc = await db["behavioral_votes"].find_one({
        "voter_id": voter_id,
        "target_id": target_id,
        "team_id": team_id,
    })
    return doc is not None


async def submit(
    db: AsyncIOMotorDatabase,
    voter_id: ObjectId,
    target_id: ObjectId,
    team_id: ObjectId,
    stars_rate: int,
) -> None:
    await db["behavioral_votes"].insert_one({
        "voter_id": voter_id,
        "target_id": target_id,
        "team_id": team_id,
        "stars_rate": stars_rate,
        "created_at": datetime.now(timezone.utc),
    })


async def aggregate_score(
    db: AsyncIOMotorDatabase,
    target_id: ObjectId,
) -> float:
    pipeline = [
        {"$match": {"target_id": target_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$stars_rate"}}},
    ]
    result = await db["behavioral_votes"].aggregate(pipeline).to_list(length=1)
    return round(result[0]["avg"], 2) if result else 0.0


async def count_votes_received_in_team(
    db: AsyncIOMotorDatabase,
    target_id: ObjectId,
    team_id: ObjectId,
) -> int:
    """Count how many voters have rated target_id within a specific team."""
    return await db["behavioral_votes"].count_documents({
        "target_id": target_id,
        "team_id": team_id,
    })


async def voted_targets_in_team(
    db: AsyncIOMotorDatabase,
    voter_id: ObjectId,
    team_id: ObjectId,
) -> list[str]:
    """Return list of target_id strings already voted by voter in this team."""
    cursor = db["behavioral_votes"].find(
        {"voter_id": voter_id, "team_id": team_id},
        {"target_id": 1},
    )
    docs = await cursor.to_list(length=None)
    return [str(d["target_id"]) for d in docs]
