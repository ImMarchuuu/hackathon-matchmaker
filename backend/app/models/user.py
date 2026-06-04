import uuid
from datetime import datetime
from typing import Literal, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.base import PyObjectId

RoleName = Literal["Developer", "Business", "UI/UX Designer", "Marketing", "AI / Data", "Pitching"]
RankTitle = Literal["Bronze", "Silver", "Gold", "Diamond"]
OAuthProvider = Literal["google", "facebook", "github"]

CompetitionType = Literal["project", "team"]


# ─── Sub-documents ────────────────────────────────────────────────────────────

class RoleEntry(BaseModel):
    name: RoleName
    tier: int = Field(ge=1, le=4)
    project_count: int = Field(ge=0)
    rank_title: RankTitle


class SkillEntry(BaseModel):
    name: str
    tier: int = Field(ge=1, le=4)
    project_count: int = Field(ge=0)
    rank_title: RankTitle


class PortfolioEntry(BaseModel):
    project_name: str
    role_played: RoleName
    skills_used: list[str] = []
    role_description: str = ""


class CompetitionExperience(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    competition_name: str = Field(min_length=1, max_length=120)
    detail: str = Field(default="", max_length=600)
    roles: list[RoleName] = Field(min_length=1)
    skills: list[str] = []
    contributor_ids: list[str] = []
    type: CompetitionType = "team"
    team_id: Optional[str] = None
    date: Optional[str] = None        # YYYY-MM-DD display date
    github_url: Optional[str] = None


class OAuthAccount(BaseModel):
    provider: OAuthProvider
    provider_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None


# ─── MongoDB document ─────────────────────────────────────────────────────────

class UserDocument(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    username: str
    name: str
    email: EmailStr
    password_hash: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_image: Optional[str] = None
    bio: Optional[str] = None
    university: Optional[str] = None
    birth_date: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    mbti: Optional[str] = None
    email_verified: bool = False
    onboarding_completed: bool = False
    behavioral_rates: float = Field(default=0.0, ge=0.0, le=5.0)
    rank_overall: RankTitle = "Bronze"
    role: list[RoleEntry] = []
    skills: list[SkillEntry] = []
    portfolios: list[PortfolioEntry] = []
    competition_experiences: list[CompetitionExperience] = []
    display_roles: list[str] = []
    oauth_accounts: list[OAuthAccount] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─── API request models ───────────────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8)


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=50)
    bio: Optional[str] = Field(default=None, max_length=500)
    university: Optional[str] = None
    birth_date: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    roles: Optional[list[RoleName]] = None
    display_roles: Optional[list[str]] = None
    onboarding_completed: Optional[bool] = None


class UpdateSkillsRequest(BaseModel):
    skills: list[SkillEntry]


class AddPortfolioRequest(BaseModel):
    project_name: str
    role_played: RoleName
    skills_used: list[str] = []
    role_description: str = ""


class AddCompetitionRequest(BaseModel):
    competition_name: str = Field(min_length=1, max_length=120)
    detail: str = Field(default="", max_length=600)
    roles: list[RoleName] = Field(min_length=1)
    skills: list[str] = []
    contributor_ids: list[str] = []
    type: CompetitionType = "project"
    date: Optional[str] = None
    github_url: Optional[str] = None


# ─── API response models ──────────────────────────────────────────────────────

class SkillRankEntry(BaseModel):
    """Single skill with live-computed rank and within-tier progress."""
    name: str
    project_count: int
    tier: int
    rank_title: str
    progress_current: int   # projects accumulated within current tier
    progress_total: int     # projects needed to fill current tier (−1 when max)
    is_max: bool            # True when Diamond and no further tier exists


class RoleRankEntry(BaseModel):
    """Single role with live-computed rank."""
    name: str
    project_count: int
    tier: int
    rank_title: str


class PaginatedResponse(BaseModel):
    """Generic paginated wrapper used by list endpoints."""
    items: list
    total: int
    page: int
    limit: int
    has_next: bool


class RankSummaryResponse(BaseModel):
    """Aggregated rank data for the skill-bank and profile pages."""
    rank_overall: str
    skills: list[SkillRankEntry]
    roles: list[RoleRankEntry]
    behavioral_rates: float


class CompetitionExperienceResponse(BaseModel):
    """Competition entry with runtime-computed reviewed flag."""
    id: str
    competition_name: str
    detail: str
    roles: list[str]
    skills: list[str]
    contributor_ids: list[str]
    type: str
    team_id: Optional[str]
    date: Optional[str]
    github_url: Optional[str]
    reviewed: bool


class FavoriteToggleResponse(BaseModel):
    target_id: str
    favorited: bool


class UserPublicResponse(BaseModel):
    """Safe to return — no password_hash, no oauth tokens."""
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: str = Field(alias="_id")
    username: str
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    cover_image: Optional[str] = None
    bio: Optional[str] = None
    university: Optional[str] = None
    birth_date: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    mbti: Optional[str] = None
    email_verified: bool = False
    onboarding_completed: bool = False
    behavioral_rates: float
    rank_overall: RankTitle
    role: list[RoleEntry]
    skills: list[SkillEntry]
    portfolios: list[PortfolioEntry]
    display_roles: list[str] = []

    @classmethod
    def from_document(cls, doc: dict) -> "UserPublicResponse":
        doc = {**doc, "_id": str(doc["_id"])}
        return cls.model_validate(doc)
