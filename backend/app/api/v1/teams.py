from typing import Optional

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.db import db_dependency
from app.core.deps import get_current_user_id
from app.models.team import TeamCreateRequest, TeamDetailResponse, TeamResponse
from app.models.user import RoleName
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
