from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def get_all(
    db: AsyncIOMotorDatabase,
    *,
    status: str | None = None,
    role: str | None = None,
) -> list[dict]:
    query: dict = {
        # Hide full teams from the feed: members < max_members
        "$expr": {"$lt": [{"$size": "$member_ids"}, "$max_members"]},
    }
    if status:
        query["status"] = status
    if role:
        query["required_roles"] = role
    cursor = db["teams"].find(query).sort("created_at", -1)
    return await cursor.to_list(length=None)


async def get_by_id(db: AsyncIOMotorDatabase, team_id: ObjectId) -> dict | None:
    return await db["teams"].find_one({"_id": team_id})


async def get_by_member(db: AsyncIOMotorDatabase, user_id: ObjectId) -> list[dict]:
    cursor = db["teams"].find({"member_ids": user_id}).sort("created_at", -1)
    return await cursor.to_list(length=None)


async def create(db: AsyncIOMotorDatabase, doc: dict) -> dict:
    result = await db["teams"].insert_one(doc)
    return await db["teams"].find_one({"_id": result.inserted_id})


async def add_join_request(
    db: AsyncIOMotorDatabase,
    team_id: ObjectId,
    request: dict,
) -> dict | None:
    from pymongo import ReturnDocument
    return await db["teams"].find_one_and_update(
        {"_id": team_id},
        {"$push": {"join_requests": request}},
        return_document=ReturnDocument.AFTER,
    )


async def update_join_request(
    db: AsyncIOMotorDatabase,
    team_id: ObjectId,
    req_id: str,
    status: str,
) -> dict | None:
    from pymongo import ReturnDocument
    return await db["teams"].find_one_and_update(
        {"_id": team_id, "join_requests.id": req_id},
        {"$set": {"join_requests.$.status": status}},
        return_document=ReturnDocument.AFTER,
    )


async def remove_join_request(
    db: AsyncIOMotorDatabase,
    team_id: ObjectId,
    req_id: str,
) -> dict | None:
    from pymongo import ReturnDocument
    return await db["teams"].find_one_and_update(
        {"_id": team_id},
        {"$pull": {"join_requests": {"id": req_id}}},
        return_document=ReturnDocument.AFTER,
    )


async def add_member(
    db: AsyncIOMotorDatabase,
    team_id: ObjectId,
    user_id: ObjectId,
) -> dict | None:
    from pymongo import ReturnDocument
    return await db["teams"].find_one_and_update(
        {"_id": team_id},
        {"$addToSet": {"member_ids": user_id}},
        return_document=ReturnDocument.AFTER,
    )
