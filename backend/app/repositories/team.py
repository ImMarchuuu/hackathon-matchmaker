from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def get_all(
    db: AsyncIOMotorDatabase,
    *,
    status: str | None = None,
    role: str | None = None,
    q: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[dict], int]:
    from datetime import date as _date
    today = _date.today().isoformat()

    query: dict = {
        "status": {"$in": ["WAITING", "IN_PROGRESS"]},
        "start_date": {"$gte": today},
        "end_date":   {"$gte": today},
        "$expr": {"$lt": [{"$size": "$member_ids"}, "$max_members"]},
    }
    if status:
        query["status"] = status
    if role:
        query["required_roles"] = role
    if q:
        query["$text"] = {"$search": q}

    total = await db["teams"].count_documents(query)
    skip = (page - 1) * limit

    sort = [("score", {"$meta": "textScore"})] if q else [("created_at", -1)]
    projection = {"score": {"$meta": "textScore"}} if q else {}

    cursor = db["teams"].find(query, projection).sort(sort).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    return items, total


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


async def add_invite(
    db: AsyncIOMotorDatabase,
    team_id: ObjectId,
    invite: dict,
) -> dict | None:
    from pymongo import ReturnDocument
    return await db["teams"].find_one_and_update(
        {"_id": team_id},
        {"$push": {"invites": invite}},
        return_document=ReturnDocument.AFTER,
    )


async def update_invite_status(
    db: AsyncIOMotorDatabase,
    team_id: ObjectId,
    user_id: str,
    status: str,
    roles: list[str] | None = None,
    skills: list[str] | None = None,
) -> dict | None:
    from pymongo import ReturnDocument
    update: dict = {"$set": {"invites.$.status": status}}
    if roles is not None:
        update["$set"]["invites.$.roles"] = roles
    if skills is not None:
        update["$set"]["invites.$.skills"] = skills
    return await db["teams"].find_one_and_update(
        {"_id": team_id, "invites.user_id": user_id, "invites.status": "pending"},
        update,
        return_document=ReturnDocument.AFTER,
    )


async def remove_member(
    db: AsyncIOMotorDatabase,
    team_id: ObjectId,
    user_id: ObjectId,
) -> dict | None:
    from pymongo import ReturnDocument
    return await db["teams"].find_one_and_update(
        {"_id": team_id},
        {"$pull": {"member_ids": user_id}},
        return_document=ReturnDocument.AFTER,
    )


async def update_fields(
    db: AsyncIOMotorDatabase,
    team_id: ObjectId,
    fields: dict,
) -> dict | None:
    from pymongo import ReturnDocument
    return await db["teams"].find_one_and_update(
        {"_id": team_id},
        {"$set": fields},
        return_document=ReturnDocument.AFTER,
    )


async def delete_team(db: AsyncIOMotorDatabase, team_id: ObjectId) -> None:
    await db["teams"].delete_one({"_id": team_id})
