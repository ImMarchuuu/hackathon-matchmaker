"""
Shared rank calculator service.

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
