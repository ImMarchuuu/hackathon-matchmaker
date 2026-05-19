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
    cursor = db["teams"].find(query)
    return await cursor.to_list(length=None)


async def get_by_id(db: AsyncIOMotorDatabase, team_id: ObjectId) -> dict | None:
    return await db["teams"].find_one({"_id": team_id})
