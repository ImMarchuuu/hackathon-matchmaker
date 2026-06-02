from typing import Optional

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.db import db_dependency
from app.core.deps import get_current_user_id
from app.models.team import AcceptInviteRequest, AddMemberRequest, JoinRequestAction, JoinRequestCreate, TeamCreateRequest, TeamDetailResponse, TeamResponse, TeamStatusUpdateRequest, TeamUpdateRequest
from app.models.user import RoleName
import redis.asyncio as aioredis

from app.core.db import redis_dependency
from app.services import team as team_service

router = APIRouter(prefix="/teams", tags=["Teams"])

TeamStatus = Optional[str]


@router.post("", response_model=TeamResponse, status_code=201, summary="Create a team")
async def create_team(
    payload: TeamCreateRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> TeamResponse:
    """Create a new team. The authenticated user becomes the leader and first member."""
    return await team_service.create_team(db, current_user_id, payload)


@router.get("", response_model=list[TeamResponse], summary="List teams")
async def list_teams(
    status: Optional[str] = None,
    role: Optional[RoleName] = None,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[TeamResponse]:
    """Return all teams, optionally filtered by status (WAITING / IN_PROGRESS) or required role."""
    return await team_service.list_teams(db, status=status, role=role)


@router.get("/{team_id}", response_model=TeamDetailResponse, summary="Get team detail")
async def get_team(
    team_id: str,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> TeamDetailResponse:
    """Return team detail with full leader and member profiles embedded."""
    return await team_service.get_team_detail(db, team_id)


@router.post("/{team_id}/requests", response_model=TeamResponse, status_code=201, summary="Send a join request")
async def send_join_request(
    team_id: str,
    payload: JoinRequestCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> TeamResponse:
    return await team_service.send_join_request(db, team_id, current_user_id, payload.roles, payload.skills)


@router.patch("/{team_id}/requests/{req_id}", response_model=TeamResponse, summary="Approve or reject a join request")
async def resolve_join_request(
    team_id: str,
    req_id: str,
    payload: JoinRequestAction,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> TeamResponse:
    return await team_service.resolve_join_request(db, team_id, req_id, payload.status, current_user_id)


@router.delete("/{team_id}/requests/{req_id}", status_code=204, summary="Cancel your join request")
async def cancel_join_request(
    team_id: str,
    req_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> None:
    await team_service.cancel_join_request(db, team_id, req_id, current_user_id)


@router.patch("/{team_id}", response_model=TeamResponse, summary="Update team details (leader only)")
async def update_team(
    team_id: str,
    payload: TeamUpdateRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> TeamResponse:
    return await team_service.update_team(db, team_id, current_user_id, payload)


@router.post("/{team_id}/members", response_model=TeamDetailResponse, status_code=201, summary="Leader directly adds a member from favorites")
async def add_member_direct(
    team_id: str,
    payload: AddMemberRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> TeamDetailResponse:
    return await team_service.add_member_direct(db, team_id, current_user_id, payload.user_id)


@router.delete("/{team_id}/members/{user_id}", response_model=TeamDetailResponse, summary="Remove a member from team (leader only)")
async def kick_member(
    team_id: str,
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> TeamDetailResponse:
    return await team_service.kick_member(db, team_id, current_user_id, user_id)


@router.post("/{team_id}/invites/accept", status_code=204, summary="Accept a team invite")
async def accept_invite(
    team_id: str,
    payload: AcceptInviteRequest = AcceptInviteRequest(),
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> None:
    await team_service.accept_invite(db, team_id, current_user_id, payload.roles, payload.skills)


@router.post("/{team_id}/invites/decline", status_code=204, summary="Decline a team invite")
async def decline_invite(
    team_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> None:
    await team_service.decline_invite(db, team_id, current_user_id)


@router.patch("/{team_id}/status", status_code=204, summary="Cancel or complete a team (leader only)")
async def update_team_status(
    team_id: str,
    payload: TeamStatusUpdateRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
    redis: aioredis.Redis = Depends(redis_dependency),
) -> None:
    if payload.status == "CANCELLED":
        await team_service.cancel_team(db, team_id, current_user_id)
    else:
        await team_service.complete_team(db, redis, team_id, current_user_id)
