from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.base import PyObjectId


class BehavioralVoteDocument(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    team_id: PyObjectId
    voter_id: PyObjectId
    target_id: PyObjectId
    stars_rate: int = Field(ge=1, le=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SubmitReviewRequest(BaseModel):
    team_id: str
    target_id: str
    stars_rate: int = Field(ge=1, le=5)


class AggregatedScoreResponse(BaseModel):
    user_id: str
    behavioral_rates: float
    vote_count: int
