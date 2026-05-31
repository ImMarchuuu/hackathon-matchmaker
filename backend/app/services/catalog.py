from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.catalog import ROLE_NAMES, RoleItem, SkillItem
from app.repositories import catalog as catalog_repo


async def list_roles(db: AsyncIOMotorDatabase) -> list[RoleItem]:
    """All 6 roles with live user counts, sorted by popularity."""
    counts = await catalog_repo.get_role_counts(db)
    roles = [RoleItem(name=name, user_count=counts.get(name, 0)) for name in ROLE_NAMES]
    return sorted(roles, key=lambda r: r.user_count, reverse=True)


async def list_skills(db: AsyncIOMotorDatabase) -> list[SkillItem]:
    """All distinct skills from the users collection, sorted by popularity."""
    docs = await catalog_repo.get_all_skills(db)
    return [SkillItem(**doc) for doc in docs]


async def search_skills(db: AsyncIOMotorDatabase, q: str) -> list[str]:
    """Prefix-search skill_catalog for autocomplete suggestions."""
    return await catalog_repo.search_skills(db, q)
