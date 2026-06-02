import uuid
from datetime import date, datetime
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
import redis.asyncio as aioredis

from app.models.team import Invite, JoinRequest, TeamCreateRequest, TeamDetailResponse, TeamResponse, TeamUpdateRequest
from app.repositories import catalog as catalog_repo
from app.repositories import notification as notif_repo
from app.repositories import team as team_repo
from app.repositories import user as user_repo
from app.services.rank import recompute_from_competitions


async def create_team(
    db: AsyncIOMotorDatabase,
    user_id: str,
    payload: TeamCreateRequest,
) -> TeamResponse:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        start = date.fromisoformat(payload.start_date)
        end_str = payload.end_date or payload.start_date
        end = date.fromisoformat(end_str)
    except ValueError:
        raise HTTPException(status_code=422, detail="Dates must be in YYYY-MM-DD format")

    if end < start:
        raise HTTPException(status_code=422, detail="end_date must not be before start_date")

    leader_oid = ObjectId(user_id)
    days_left = max(0, (start - date.today()).days)

    doc = {
        "title": payload.title,
        "leader_id": leader_oid,
        "status": "WAITING",
        "start_date": payload.start_date,
        "end_date": end_str,
        "days_left": days_left,
        "required_roles": list(payload.required_roles),
        "required_skills": list(payload.required_skills),
        "positions": [{"role": r, "filled": False, "invited_user_id": None} for r in payload.required_roles],
        "member_ids": [leader_oid],
        "max_members": payload.max_members,
        "description": payload.description,
        "leader_roles": list(payload.leader_roles),
        "leader_skills": list(payload.leader_skills),
        "created_at": datetime.utcnow(),
    }

    inserted = await team_repo.create(db, doc)

    # Grow the skill catalog with any new skill names
    await catalog_repo.upsert_skills(db, list(payload.required_skills))

    return TeamResponse.from_document(inserted)


async def get_user_teams(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> list[TeamResponse]:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=422, detail="Invalid user ID format")
    docs = await team_repo.get_by_member(db, ObjectId(user_id))
    return [TeamResponse.from_document(d) for d in docs]


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


async def send_join_request(
    db: AsyncIOMotorDatabase,
    team_id: str,
    user_id: str,
    roles: list[str],
    skills: list[str],
) -> TeamResponse:
    if not ObjectId.is_valid(team_id) or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=422, detail="Invalid ID format")

    team_oid = ObjectId(team_id)
    user_oid = ObjectId(user_id)

    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")

    # Reject if the event has already started (start_date is the event start)
    if doc.get("start_date", "9999-12-31") <= date.today().isoformat():
        raise HTTPException(status_code=409, detail="Team event has already started")

    if user_oid in doc.get("member_ids", []):
        raise HTTPException(status_code=409, detail="Already a member")

    if str(doc["leader_id"]) == user_id:
        raise HTTPException(status_code=409, detail="You are the leader")

    existing = next(
        (r for r in doc.get("join_requests", []) if str(r["user_id"]) == user_id and r["status"] == "pending"),
        None,
    )
    if existing:
        raise HTTPException(status_code=409, detail="Request already pending")

    # Only keep selections that the team actually has open
    valid_roles = [r for r in roles if r in doc.get("required_roles", [])]
    valid_skills = [s for s in skills if s in doc.get("required_skills", [])]

    request = JoinRequest(user_id=user_id, roles=valid_roles, skills=valid_skills).model_dump()
    updated = await team_repo.add_join_request(db, team_oid, request)

    # Notify the leader
    requester = await user_repo.get_by_id(db, user_oid)
    await notif_repo.create(db, doc["leader_id"], "join_request", {
        "team_id": team_id,
        "team_name": doc["title"],
        "requester_id": user_id,
        "requester_name": requester.get("name", "") if requester else "",
        "requester_avatar": requester.get("avatar_url") if requester else None,
        "request_id": request["id"],
        "roles": valid_roles,
        "skills": valid_skills,
    })

    return TeamResponse.from_document(updated)


async def resolve_join_request(
    db: AsyncIOMotorDatabase,
    team_id: str,
    req_id: str,
    status: str,
    leader_id: str,
) -> TeamResponse:
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=422, detail="Invalid team ID")

    team_oid = ObjectId(team_id)
    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")
    if str(doc["leader_id"]) != leader_id:
        raise HTTPException(status_code=403, detail="Only the team leader can resolve requests")

    request = next((r for r in doc.get("join_requests", []) if r["id"] == req_id), None)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request["status"] != "pending":
        raise HTTPException(status_code=409, detail="Request already resolved")

    updated = await team_repo.update_join_request(db, team_oid, req_id, status)

    user_oid = ObjectId(str(request["user_id"]))
    if status == "approved":
        await team_repo.add_member(db, team_oid, user_oid)
        updated = await team_repo.get_by_id(db, team_oid)
        notif_type = "request_approved"
    else:
        notif_type = "request_rejected"

    await notif_repo.create(db, user_oid, notif_type, {
        "team_id": team_id,
        "team_name": doc["title"],
    })

    # Stamp the leader's original join_request notification so it shows resolved state
    await notif_repo.stamp_request_resolved(db, ObjectId(leader_id), req_id, status)

    return TeamResponse.from_document(updated)


async def update_team(
    db: AsyncIOMotorDatabase,
    team_id: str,
    leader_id: str,
    payload: TeamUpdateRequest,
) -> TeamResponse:
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=422, detail="Invalid team ID")

    team_oid = ObjectId(team_id)
    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")
    if str(doc["leader_id"]) != leader_id:
        raise HTTPException(status_code=403, detail="Only the team leader can edit team details")

    fields: dict = {}
    if payload.title is not None:
        fields["title"] = payload.title
    if payload.description is not None:
        fields["description"] = payload.description
    if payload.start_date is not None:
        fields["start_date"] = payload.start_date
    if payload.end_date is not None:
        fields["end_date"] = payload.end_date
    if payload.required_roles is not None:
        fields["required_roles"] = list(payload.required_roles)
        fields["positions"] = [
            {"role": r, "filled": False, "invited_user_id": None}
            for r in payload.required_roles
        ]
    if payload.required_skills is not None:
        fields["required_skills"] = list(payload.required_skills)
        await catalog_repo.upsert_skills(db, list(payload.required_skills))
    if payload.max_members is not None:
        fields["max_members"] = payload.max_members

    if not fields:
        return TeamResponse.from_document(doc)

    updated = await team_repo.update_fields(db, team_oid, fields)
    return TeamResponse.from_document(updated)


async def add_member_direct(
    db: AsyncIOMotorDatabase,
    team_id: str,
    leader_id: str,
    user_id: str,
) -> TeamDetailResponse:
    """Leader sends a pending invite to a user from favorites."""
    if not ObjectId.is_valid(team_id) or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=422, detail="Invalid ID format")

    team_oid = ObjectId(team_id)
    user_oid = ObjectId(user_id)

    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")
    if str(doc["leader_id"]) != leader_id:
        raise HTTPException(status_code=403, detail="Only the team leader can send invites")
    if user_oid in doc.get("member_ids", []):
        raise HTTPException(status_code=409, detail="User is already a member")
    if len(doc.get("member_ids", [])) >= doc.get("max_members", 10):
        raise HTTPException(status_code=409, detail="Team is full")

    # Prevent duplicate pending invites
    existing = next(
        (i for i in doc.get("invites", []) if str(i["user_id"]) == user_id and i["status"] == "pending"),
        None,
    )
    if existing:
        raise HTTPException(status_code=409, detail="Invite already pending")

    invite = Invite(user_id=user_id).model_dump()
    await team_repo.add_invite(db, team_oid, invite)

    await notif_repo.create(db, user_oid, "team_invite", {
        "team_id": team_id,
        "team_name": doc["title"],
        "invite_id": invite["id"],
        "required_roles": doc.get("required_roles", []),
        "required_skills": doc.get("required_skills", []),
    })

    return await get_team_detail(db, team_id)


async def accept_invite(
    db: AsyncIOMotorDatabase,
    team_id: str,
    user_id: str,
    roles: list[str] | None = None,
    skills: list[str] | None = None,
) -> None:
    if not ObjectId.is_valid(team_id) or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=422, detail="Invalid ID format")

    team_oid = ObjectId(team_id)
    user_oid = ObjectId(user_id)

    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")

    invite = next(
        (i for i in doc.get("invites", []) if str(i["user_id"]) == user_id and i["status"] == "pending"),
        None,
    )
    if not invite:
        raise HTTPException(status_code=404, detail="No pending invite found")
    if len(doc.get("member_ids", [])) >= doc.get("max_members", 10):
        raise HTTPException(status_code=409, detail="Team is now full")

    await team_repo.update_invite_status(db, team_oid, user_id, "accepted", roles, skills)
    await team_repo.add_member(db, team_oid, user_oid)

    # Stamp the invite_resolved field on the user's team_invite notification
    await notif_repo.stamp_invite_resolved(db, user_oid, team_id, "accepted")

    user_doc = await user_repo.get_by_id(db, user_oid)
    await notif_repo.create(db, doc["leader_id"], "invite_accepted", {
        "team_id": team_id,
        "team_name": doc["title"],
        "user_id": user_id,
        "user_name": user_doc.get("name", "") if user_doc else "",
        "user_avatar": user_doc.get("avatar_url") if user_doc else None,
        "roles": roles or [],
        "skills": skills or [],
    })


async def decline_invite(
    db: AsyncIOMotorDatabase,
    team_id: str,
    user_id: str,
) -> None:
    if not ObjectId.is_valid(team_id) or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=422, detail="Invalid ID format")

    team_oid = ObjectId(team_id)
    user_oid = ObjectId(user_id)

    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")

    invite = next(
        (i for i in doc.get("invites", []) if str(i["user_id"]) == user_id and i["status"] == "pending"),
        None,
    )
    if not invite:
        raise HTTPException(status_code=404, detail="No pending invite found")

    await team_repo.update_invite_status(db, team_oid, user_id, "declined")

    # Stamp the invite_resolved field on the user's team_invite notification
    await notif_repo.stamp_invite_resolved(db, user_oid, team_id, "declined")

    user_doc = await user_repo.get_by_id(db, user_oid)
    await notif_repo.create(db, doc["leader_id"], "invite_declined", {
        "team_id": team_id,
        "team_name": doc["title"],
        "user_id": user_id,
        "user_name": user_doc.get("name", "") if user_doc else "",
    })


async def kick_member(
    db: AsyncIOMotorDatabase,
    team_id: str,
    leader_id: str,
    user_id: str,
) -> TeamDetailResponse:
    if not ObjectId.is_valid(team_id) or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=422, detail="Invalid ID format")

    team_oid = ObjectId(team_id)
    user_oid = ObjectId(user_id)

    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")
    if str(doc["leader_id"]) != leader_id:
        raise HTTPException(status_code=403, detail="Only the team leader can remove members")
    if user_id == leader_id:
        raise HTTPException(status_code=400, detail="Leader cannot remove themselves")

    await team_repo.remove_member(db, team_oid, user_oid)

    await notif_repo.create(db, user_oid, "team_kicked", {
        "team_id": team_id,
        "team_name": doc["title"],
    })

    return await get_team_detail(db, team_id)


async def cancel_team(
    db: AsyncIOMotorDatabase,
    team_id: str,
    leader_id: str,
) -> None:
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=422, detail="Invalid team ID")

    team_oid = ObjectId(team_id)
    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")
    if str(doc["leader_id"]) != leader_id:
        raise HTTPException(status_code=403, detail="Only the team leader can cancel the team")

    member_ids = [mid for mid in doc.get("member_ids", []) if str(mid) != leader_id]
    for mid in member_ids:
        await notif_repo.create(db, mid, "team_cancelled", {
            "team_id": team_id,
            "team_name": doc["title"],
        })

    await team_repo.delete_team(db, team_oid)


async def complete_team(
    db: AsyncIOMotorDatabase,
    redis: aioredis.Redis,
    team_id: str,
    leader_id: str,
) -> None:
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=422, detail="Invalid team ID")

    team_oid = ObjectId(team_id)
    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")
    if str(doc["leader_id"]) != leader_id:
        raise HTTPException(status_code=403, detail="Only the team leader can complete the team")

    member_ids = doc.get("member_ids", [])
    team_roles = doc.get("required_roles", [])
    team_skills = doc.get("required_skills", [])
    leader_roles = doc.get("leader_roles") or team_roles
    leader_skills = doc.get("leader_skills") or team_skills

    # Build per-member role/skill map from approved join requests
    member_declared: dict[str, dict] = {}
    for req in doc.get("join_requests", []):
        if req.get("status") == "approved":
            member_declared[str(req["user_id"])] = {
                "roles": req.get("roles") or [],
                "skills": req.get("skills") or [],
            }
    # Also pick up roles/skills declared by invited members at accept time
    for inv in doc.get("invites", []):
        if inv.get("status") == "accepted":
            uid = str(inv["user_id"])
            if uid not in member_declared:
                member_declared[uid] = {
                    "roles": inv.get("roles") or [],
                    "skills": inv.get("skills") or [],
                }

    # For each member: add a competition_experience entry then recompute ranks
    for mid in member_ids:
        mid_str = str(mid)
        declared = member_declared.get(mid_str)

        if declared:
            member_roles = declared["roles"] or team_roles
            member_skills = declared["skills"] or team_skills
        else:
            # Leader — use their explicitly declared role/skills
            member_roles = leader_roles
            member_skills = leader_skills

        if not member_roles:
            continue  # CompetitionExperience requires at least 1 role

        other_ids = [str(m) for m in member_ids if m != mid]
        comp_entry = {
            "id": uuid.uuid4().hex,
            "competition_name": doc["title"],
            "detail": "",
            "roles": member_roles,
            "skills": member_skills,
            "contributor_ids": other_ids,
            "type": "team",
            "team_id": team_id,
            "date": date.today().isoformat(),
            "github_url": None,
        }
        await db["users"].update_one(
            {"_id": mid},
            {"$push": {"competition_experiences": comp_entry}},
        )
        await recompute_from_competitions(db, redis, mid)

    await team_repo.update_fields(db, team_oid, {"status": "COMPLETED"})

    # Notify each member to rate their teammates
    for mid in member_ids:
        teammate_ids = [str(m) for m in member_ids if m != mid]
        await notif_repo.create(db, mid, "team_completed", {
            "team_id": team_id,
            "team_name": doc["title"],
            "teammate_ids": teammate_ids,
        })


async def cancel_join_request(
    db: AsyncIOMotorDatabase,
    team_id: str,
    req_id: str,
    user_id: str,
) -> TeamResponse:
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=422, detail="Invalid team ID")

    team_oid = ObjectId(team_id)
    doc = await team_repo.get_by_id(db, team_oid)
    if not doc:
        raise HTTPException(status_code=404, detail="Team not found")

    request = next((r for r in doc.get("join_requests", []) if r["id"] == req_id), None)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if str(request["user_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not your request")

    updated = await team_repo.remove_join_request(db, team_oid, req_id)
    return TeamResponse.from_document(updated)
