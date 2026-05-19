from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.team import TeamDetailResponse, TeamResponse
from app.repositories import team as team_repo
from app.repositories import user as user_repo


async def list_teams(
    db: AsyncIOMotorDatabase,
    *,
    status: str | None = None,
    role: str | None = None,
) -> list[TeamResponse]:
    docs = await team_repo.get_all(db, status=status, role=role)
    return [TeamResponse.from_document(d) for d in docs]


async def get_team_detail(
    db: AsyncIOMotorDatabase,
    team_id: str,
) -> TeamDetailResponse:
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=422, detail="Invalid team ID format")

    doc = await team_repo.get_by_id(db, ObjectId(team_id))
    if not doc:
        raise HTTPException(status_code=404, detail=f"Team '{team_id}' not found")

    leader_doc = await user_repo.get_by_id(db, doc["leader_id"])
    if not leader_doc:
        raise HTTPException(status_code=500, detail="Team leader not found")

    member_ids = doc.get("member_ids", [])
    member_docs = await user_repo.get_by_ids(db, member_ids)

    # Preserve order from member_ids
    member_index = {str(m["_id"]): m for m in member_docs}
    ordered_members = [member_index[str(mid)] for mid in member_ids if str(mid) in member_index]

    return TeamDetailResponse.from_document_with_members(doc, leader_doc, ordered_members)
