from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.db import db_dependency
from app.models.catalog import RoleItem, SkillItem
from app.services import catalog as catalog_service

router = APIRouter(prefix="/catalog", tags=["Catalog"])


@router.get("/roles", response_model=list[RoleItem], summary="List all roles")
async def list_roles(
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[RoleItem]:
    """Return all available roles with the number of users that hold each one."""
    return await catalog_service.list_roles(db)


@router.get("/skills", response_model=list[SkillItem], summary="List all skills")
async def list_skills(
    db: AsyncIOMotorDatabase = Depends(db_dependency),
) -> list[SkillItem]:
    """Return all distinct skills aggregated from users, sorted by popularity."""
    return await catalog_service.list_skills(db)
