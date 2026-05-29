"""
Shared rank calculator and rank-summary service.

Tier mapping:
  Bronze  (1) — project_count < silver threshold
  Silver  (2) — project_count >= silver threshold
  Gold    (3) — project_count >= gold threshold
  Diamond (4) — project_count >= diamond threshold

Thresholds are stored in Redis hash ``rank:thresholds`` so they can be
adjusted at runtime without a redeploy.  Computed results are cached per
project_count with a 1-hour TTL.
"""

import logging
from typing import TypedDict

import redis.asyncio as aioredis
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories import user as user_repo

logger = logging.getLogger(__name__)

# ── Redis keys ────────────────────────────────────────────────────────────────

_THRESHOLDS_KEY = "rank:thresholds"   # Redis hash: {silver, gold, diamond} → int
_CACHE_PREFIX   = "rank:result:"       # rank:result:{project_count} → "tier:rank_title"
_CACHE_TTL      = 3_600               # seconds (1 hour)

# ── Default thresholds ────────────────────────────────────────────────────────

_DEFAULTS: dict[str, int] = {
    "silver":  2,   # >=  2 projects → Silver
    "gold":    5,   # >=  5 projects → Gold
    "diamond": 10,  # >= 10 projects → Diamond
}


# ── Types ─────────────────────────────────────────────────────────────────────

class RankResult(TypedDict):
    tier: int          # 1 = Bronze … 4 = Diamond
    rank_title: str    # "Bronze" | "Silver" | "Gold" | "Diamond"


# ── Bootstrap ─────────────────────────────────────────────────────────────────

async def seed_thresholds(redis: aioredis.Redis) -> None:
    """
    Write default thresholds into Redis using HSETNX so that any manually
    configured values already in Redis are preserved across restarts.
    """
    for field, value in _DEFAULTS.items():
        await redis.hsetnx(_THRESHOLDS_KEY, field, value)
    logger.info("✅  Rank thresholds ready (key: %s)", _THRESHOLDS_KEY)


# ── Core helpers ──────────────────────────────────────────────────────────────

async def _get_thresholds(redis: aioredis.Redis) -> dict[str, int]:
    """Read current thresholds from Redis, falling back to defaults on miss."""
    raw = await redis.hgetall(_THRESHOLDS_KEY)
    if not raw:
        return dict(_DEFAULTS)
    return {k: int(v) for k, v in raw.items()}


def _compute(project_count: int, thresholds: dict[str, int]) -> RankResult:
    """Pure computation — no I/O."""
    silver  = thresholds.get("silver",  _DEFAULTS["silver"])
    gold    = thresholds.get("gold",    _DEFAULTS["gold"])
    diamond = thresholds.get("diamond", _DEFAULTS["diamond"])

    if project_count >= diamond:
        return RankResult(tier=4, rank_title="Diamond")
    if project_count >= gold:
        return RankResult(tier=3, rank_title="Gold")
    if project_count >= silver:
        return RankResult(tier=2, rank_title="Silver")
    return RankResult(tier=1, rank_title="Bronze")


# ── Public API ────────────────────────────────────────────────────────────────

async def rank_for_count(redis: aioredis.Redis, project_count: int) -> RankResult:
    """
    Return the rank for a given project_count.

    Flow:
      1. Check Redis result cache.
      2. On miss: read thresholds from Redis and compute.
      3. Write result back to cache with TTL.
    """
    cache_key = f"{_CACHE_PREFIX}{project_count}"

    cached = await redis.get(cache_key)
    if cached:
        tier_str, rank_title = cached.split(":", 1)
        return RankResult(tier=int(tier_str), rank_title=rank_title)

    thresholds = await _get_thresholds(redis)
    result = _compute(project_count, thresholds)

    await redis.set(cache_key, f"{result['tier']}:{result['rank_title']}", ex=_CACHE_TTL)
    return result


async def rank_overall_for_entries(
    redis: aioredis.Redis,
    entries: list[dict],
) -> str:
    """
    Given a list of role or skill sub-documents (each with a ``project_count``),
    return the ``rank_title`` of the highest tier among all entries.
    Falls back to ``"Bronze"`` when the list is empty.
    """
    if not entries:
        return "Bronze"

    best = RankResult(tier=0, rank_title="Bronze")
    for entry in entries:
        result = await rank_for_count(redis, entry.get("project_count", 0))
        if result["tier"] > best["tier"]:
            best = result

    return best["rank_title"]


def _progress_within_tier(
    project_count: int,
    thresholds: dict[str, int],
) -> tuple[int, int, bool]:
    """
    Return (progress_current, progress_total, is_max) for the progress bar
    within the current tier.

    Examples (defaults: silver=2, gold=5, diamond=10):
      count=1  → Bronze  → (1, 2, False)   — 1 of 2 towards Silver
      count=3  → Silver  → (1, 3, False)   — 1 of 3 towards Gold
      count=7  → Gold    → (2, 5, False)   — 2 of 5 towards Diamond
      count=12 → Diamond → (12, 12, True)  — max rank
    """
    silver  = thresholds.get("silver",  _DEFAULTS["silver"])
    gold    = thresholds.get("gold",    _DEFAULTS["gold"])
    diamond = thresholds.get("diamond", _DEFAULTS["diamond"])

    if project_count >= diamond:
        return (project_count, project_count, True)
    if project_count >= gold:
        return (project_count - gold, diamond - gold, False)
    if project_count >= silver:
        return (project_count - silver, gold - silver, False)
    # Bronze
    return (project_count, silver, False)


async def get_rank_summary(
    db: AsyncIOMotorDatabase,
    redis: aioredis.Redis,
    user_id: str,
) -> dict:
    """
    Build the full rank summary for a user:
      - live-computed tier + within-tier progress for every skill
      - live-computed tier for every role
      - rank_overall derived from skills
      - behavioral_rates (soft skill score)

    Raises 422 on bad ID, 404 when user not found.
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=422, detail="Invalid user ID format")

    doc = await user_repo.get_by_id(db, ObjectId(user_id))
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")

    # Read thresholds once — reuse for all entries
    thresholds = await _get_thresholds(redis)

    # ── Skills ──────────────────────────────────────────────────────────────
    skill_entries = []
    for s in doc.get("skills", []):
        count = s.get("project_count", 0)
        rank  = _compute(count, thresholds)
        cur, total, is_max = _progress_within_tier(count, thresholds)
        skill_entries.append({
            "name":             s["name"],
            "project_count":    count,
            "tier":             rank["tier"],
            "rank_title":       rank["rank_title"],
            "progress_current": cur,
            "progress_total":   total,
            "is_max":           is_max,
        })

    # ── Roles ───────────────────────────────────────────────────────────────
    role_entries = []
    for r in doc.get("role", []):
        count = r.get("project_count", 0)
        rank  = _compute(count, thresholds)
        role_entries.append({
            "name":          r["name"],
            "project_count": count,
            "tier":          rank["tier"],
            "rank_title":    rank["rank_title"],
        })

    # ── Overall rank (best skill tier) ──────────────────────────────────────
    if skill_entries:
        best_tier = max(s["tier"] for s in skill_entries)
        rank_overall = next(
            s["rank_title"] for s in skill_entries if s["tier"] == best_tier
        )
    else:
        rank_overall = "Bronze"

    return {
        "rank_overall":    rank_overall,
        "skills":          skill_entries,
        "roles":           role_entries,
        "behavioral_rates": doc.get("behavioral_rates", 0.0),
    }


async def recompute_from_competitions(
    db: AsyncIOMotorDatabase,
    redis: aioredis.Redis,
    user_id: ObjectId,
) -> None:
    """
    Scan competition_experiences and recompute project_count, tier, and
    rank_title for every role and skill entry on the user document.

    Called after any competition mutation (add / edit / delete) so that
    rank data always reflects the full competition history.

    Roles/skills present in the user document but not in any competition
    are kept with their existing project_count preserved from profile edits.
    New roles/skills found in competitions are added automatically.
    """
    doc = await user_repo.get_by_id(db, user_id)
    if not doc:
        return

    competitions = doc.get("competition_experiences", [])
    thresholds   = await _get_thresholds(redis)

    # ── Count occurrences across all competition entries ──────────────────────
    role_counts: dict[str, int] = {}
    skill_counts: dict[str, int] = {}

    for comp in competitions:
        for r in comp.get("roles", []):
            role_counts[r] = role_counts.get(r, 0) + 1
        for s in comp.get("skills", []):
            skill_counts[s] = skill_counts.get(s, 0) + 1

    # ── Rebuild role entries ──────────────────────────────────────────────────
    existing_roles = {r["name"]: r for r in doc.get("role", [])}

    # Union: all previously declared roles + any new ones from competitions
    all_role_names = set(existing_roles) | set(role_counts)
    new_roles = []
    for name in all_role_names:
        count = role_counts.get(name, existing_roles.get(name, {}).get("project_count", 0))
        rank  = _compute(count, thresholds)
        new_roles.append({
            "name":          name,
            "project_count": count,
            "tier":          rank["tier"],
            "rank_title":    rank["rank_title"],
        })

    # ── Rebuild skill entries ─────────────────────────────────────────────────
    existing_skills = {s["name"]: s for s in doc.get("skills", [])}

    all_skill_names = set(existing_skills) | set(skill_counts)
    new_skills = []
    for name in all_skill_names:
        count = skill_counts.get(name, existing_skills.get(name, {}).get("project_count", 0))
        rank  = _compute(count, thresholds)
        new_skills.append({
            "name":          name,
            "project_count": count,
            "tier":          rank["tier"],
            "rank_title":    rank["rank_title"],
        })

    # ── Overall rank (best skill tier) ───────────────────────────────────────
    if new_skills:
        best_tier    = max(s["tier"] for s in new_skills)
        rank_overall = next(s["rank_title"] for s in new_skills if s["tier"] == best_tier)
    else:
        rank_overall = "Bronze"

    await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"role": new_roles, "skills": new_skills, "rank_overall": rank_overall}},
    )
