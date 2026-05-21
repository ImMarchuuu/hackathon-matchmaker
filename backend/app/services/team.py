from datetime import date, datetime
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.team import TeamCreateRequest, TeamDetailResponse, TeamResponse
from app.repositories import catalog as catalog_repo
from app.repositories import team as team_repo
from app.repositories import user as user_repo


async def create_team(
    db: AsyncIOMotorDatabase,
    user_id: str,
    payload: TeamCreateRequest,
) -> TeamResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        start = date.fromisoformat(payload.start_date)
        end = date.fromisoformat(payload.end_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="Dates must be in YYYY-MM-DD format")

    if end <= start:
        raise HTTPException(status_code=422, detail="end_date must be after start_date")

    leader_oid = ObjectId(user_id)
    days_left = max(0, (end - date.today()).days)

    doc = {
        "title": payload.title,
        "leader_id": leader_oid,
        "status": "WAITING",
        "start_date": payload.start_date,
        "end_date": payload.end_date,
        "days_left": days_left,
        "required_roles": list(payload.required_roles),
        "required_skills": list(payload.required_skills),
        "positions": [{"role": r, "filled": False, "invited_user_id": None} for r in payload.required_roles],
        "member_ids": [leader_oid],
        "max_members": payload.max_members,
        "description": payload.description,
        "created_at": datetime.utcnow(),
    }

    inserted = await team_repo.create(db, doc)

    # Grow the skill catalog with any new skill names
    await catalog_repo.upsert_skills(db, list(payload.required_skills))

    return TeamResponse.from_document(inserted)


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
