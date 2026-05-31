import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.base import PyObjectId
from app.models.user import RoleName, UserPublicResponse

TeamStatus = Literal["WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]


# ─── Sub-documents ────────────────────────────────────────────────────────────

JoinRequestStatus = Literal["pending", "approved", "rejected"]


class JoinRequest(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    user_id: str
    roles: list[str] = []
    skills: list[str] = []
    status: JoinRequestStatus = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JoinRequestCreate(BaseModel):
    roles: list[str] = []
    skills: list[str] = []


class JoinRequestAction(BaseModel):
    status: Literal["approved", "rejected"]


class Position(BaseModel):
    role: RoleName
    filled: bool = False
    invited_user_id: Optional[str] = None


# ─── MongoDB document ─────────────────────────────────────────────────────────

class TeamDocument(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: str
    leader_id: PyObjectId
    status: TeamStatus = "WAITING"
    start_date: str
    end_date: str
    days_left: int = Field(ge=0)
    required_roles: list[RoleName] = []
    required_skills: list[str] = []
    positions: list[Position] = []
    member_ids: list[PyObjectId] = []
    max_members: int = Field(ge=2, le=10)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─── API request models ───────────────────────────────────────────────────────

class TeamCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    start_date: str
    end_date: str
    required_roles: list[RoleName] = []
    required_skills: list[str] = []
    max_members: int = Field(ge=2, le=10)
    description: Optional[str] = None


class InviteMemberRequest(BaseModel):
    user_id: str
    role: RoleName


class TeamUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=100)
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    required_roles: Optional[list[RoleName]] = None
    required_skills: Optional[list[str]] = None
    max_members: Optional[int] = Field(default=None, ge=2, le=10)


class TeamStatusUpdateRequest(BaseModel):
    status: Literal["COMPLETED", "CANCELLED"]


class AddMemberRequest(BaseModel):
    user_id: str


# ─── API response models ──────────────────────────────────────────────────────

class TeamResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: str = Field(alias="_id")
    title: str
    leader_id: str
    status: TeamStatus
    start_date: str
    end_date: str
    days_left: int
    required_roles: list[RoleName]
    required_skills: list[str]
    positions: list[Position]
    member_ids: list[str]
    max_members: int
    description: Optional[str] = None
    created_at: datetime
    join_requests: list[JoinRequest] = []

    @classmethod
    def from_document(cls, doc: dict) -> "TeamResponse":
        doc = {
            **doc,
            "_id": str(doc["_id"]),
            "leader_id": str(doc["leader_id"]),
            "member_ids": [str(m) for m in doc.get("member_ids", [])],
            "join_requests": [
                {**r, "user_id": str(r["user_id"])}
                for r in doc.get("join_requests", [])
            ],
        }
        return cls.model_validate(doc)


class TeamDetailResponse(TeamResponse):
    """Team response with full member profiles embedded."""
    leader: UserPublicResponse
    members: list[UserPublicResponse]

    @classmethod
    def from_document_with_members(
        cls,
        doc: dict,
        leader_doc: dict,
        member_docs: list[dict],
    ) -> "TeamDetailResponse":
        base = {
            **doc,
            "_id": str(doc["_id"]),
            "leader_id": str(doc["leader_id"]),
            "member_ids": [str(m) for m in doc.get("member_ids", [])],
            "leader": UserPublicResponse.from_document(leader_doc).model_dump(),
            "members": [UserPublicResponse.from_document(m).model_dump() for m in member_docs],
        }
        return cls.model_validate(base)
