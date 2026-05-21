from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def get_all(
    db: AsyncIOMotorDatabase,
    *,
    status: str | None = None,
    role: str | None = None,
) -> list[dict]:
    query: dict = {}
    if status:
        query["status"] = status
    if role:
        query["required_roles"] = role
    cursor = db["teams"].find(query).sort("created_at", -1)
    return await cursor.to_list(length=None)


async def get_by_id(db: AsyncIOMotorDatabase, team_id: ObjectId) -> dict | None:
    return await db["teams"].find_one({"_id": team_id})


async def create(db: AsyncIOMotorDatabase, doc: dict) -> dict:
    result = await db["teams"].insert_one(doc)
    return await db["teams"].find_one({"_id": result.inserted_id})
