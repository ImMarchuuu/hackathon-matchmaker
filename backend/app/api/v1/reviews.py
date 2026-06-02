from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.db import db_dependency
from app.core.deps import get_current_user_id
from app.models.behavioral_vote import AggregatedScoreResponse, SubmitReviewRequest
from app.services import behavioral_vote as vote_service

router = APIRouter(tags=["Reviews"])


@router.post("/reviews", response_model=AggregatedScoreResponse, status_code=201, summary="Submit a peer review")
async def submit_review(
    payload: SubmitReviewRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> AggregatedScoreResponse:
    """Rate a teammate 1–5 stars. One vote per voter/target/team combination."""
    return await vote_service.submit_review(
        db,
        voter_id=current_user_id,
        target_id=payload.target_id,
        team_id=payload.team_id,
        stars_rate=payload.stars_rate,
    )


@router.get("/reviews/my", response_model=list[str], summary="Get IDs of teammates already rated in a team")
async def get_my_votes(
    team_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[str]:
    """Return target_id strings the current user has already voted for in this team."""
    return await vote_service.get_my_votes_in_team(db, current_user_id, team_id)


@router.get("/users/{user_id}/reviews/score", response_model=AggregatedScoreResponse, summary="Get aggregated review score")
async def get_score(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> AggregatedScoreResponse:
    """Return the aggregated behavioral rating for a user."""
    return await vote_service.get_score(db, user_id)
