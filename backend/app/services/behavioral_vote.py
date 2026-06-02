from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories import behavioral_vote as vote_repo
from app.repositories import team as team_repo
from app.models.behavioral_vote import AggregatedScoreResponse


async def submit_review(
    db: AsyncIOMotorDatabase,
    voter_id: str,
    target_id: str,
    team_id: str,
    stars_rate: int,
) -> AggregatedScoreResponse:
    if not all(ObjectId.is_valid(x) for x in [voter_id, target_id, team_id]):
        raise HTTPException(status_code=422, detail="Invalid ID format")

    if voter_id == target_id:
        raise HTTPException(status_code=400, detail="Cannot rate yourself")

    voter_oid  = ObjectId(voter_id)
    target_oid = ObjectId(target_id)
    team_oid   = ObjectId(team_id)

    # Voter and target must both be members of the completed team
    team_doc = await team_repo.get_by_id(db, team_oid)
    if not team_doc:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_doc.get("status") != "COMPLETED":
        raise HTTPException(status_code=409, detail="Team has not been completed yet")

    member_ids = [str(m) for m in team_doc.get("member_ids", [])]
    if voter_id not in member_ids:
        raise HTTPException(status_code=403, detail="You are not a member of this team")
    if target_id not in member_ids:
        raise HTTPException(status_code=404, detail="Target user is not a member of this team")

    if await vote_repo.has_voted(db, voter_oid, target_oid, team_oid):
        raise HTTPException(status_code=409, detail="You have already rated this teammate")

    await vote_repo.submit(db, voter_oid, target_oid, team_oid, stars_rate)

    # Recompute and persist behavioral_rates on the target user
    new_avg = await vote_repo.aggregate_score(db, target_oid)
    await db["users"].update_one(
        {"_id": target_oid},
        {"$set": {"behavioral_rates": new_avg}},
    )

    vote_count_doc = await db["behavioral_votes"].count_documents({"target_id": target_oid})

    return AggregatedScoreResponse(
        user_id=target_id,
        behavioral_rates=new_avg,
        vote_count=vote_count_doc,
    )


async def get_score(
    db: AsyncIOMotorDatabase,
    target_id: str,
) -> AggregatedScoreResponse:
    if not ObjectId.is_valid(target_id):
        raise HTTPException(status_code=422, detail="Invalid user ID")

    target_oid = ObjectId(target_id)
    avg = await vote_repo.aggregate_score(db, target_oid)
    count = await db["behavioral_votes"].count_documents({"target_id": target_oid})

    return AggregatedScoreResponse(
        user_id=target_id,
        behavioral_rates=avg,
        vote_count=count,
    )


async def get_my_votes_in_team(
    db: AsyncIOMotorDatabase,
    voter_id: str,
    team_id: str,
) -> list[str]:
    if not ObjectId.is_valid(voter_id) or not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=422, detail="Invalid ID format")
    return await vote_repo.voted_targets_in_team(
        db, ObjectId(voter_id), ObjectId(team_id)
    )
