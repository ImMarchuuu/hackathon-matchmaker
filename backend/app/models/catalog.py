from pydantic import BaseModel

from app.models.user import RoleName

ROLE_NAMES: list[RoleName] = [
    "Developer",
    "Business",
    "UI/UX Designer",
    "Marketing",
    "AI / Data",
    "Pitching",
]


class RoleItem(BaseModel):
    name: RoleName
    user_count: int = 0


class SkillItem(BaseModel):
    name: str
    user_count: int
