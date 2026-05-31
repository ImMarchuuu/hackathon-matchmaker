import logging
from typing import Optional

import redis.asyncio as aioredis
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

logger = logging.getLogger(__name__)

_mongo_client: Optional[AsyncIOMotorClient] = None
_mongo_db: Optional[AsyncIOMotorDatabase] = None
_redis_client: Optional[aioredis.Redis] = None


async def init_db_connections() -> None:
    await _init_mongo()
    await _init_redis()


async def _init_mongo() -> None:
    global _mongo_client, _mongo_db
    logger.info("Connecting to MongoDB…")
    _mongo_client = AsyncIOMotorClient(
        settings.mongo_uri,
        serverSelectionTimeoutMS=5_000,
        connectTimeoutMS=5_000,
        tz_aware=True,
    )
    await _mongo_client.admin.command("ping")
    _mongo_db = _mongo_client[settings.mongo_db]
    logger.info("✅  MongoDB connected — db: %s", settings.mongo_db)


async def _init_redis() -> None:
    global _redis_client
    logger.info("Connecting to Redis…")
    _redis_client = aioredis.from_url(
        settings.redis_uri,
        encoding="utf-8",
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
    )
    await _redis_client.ping()
    logger.info("✅  Redis connected")


async def close_db_connections() -> None:
    global _mongo_client, _redis_client
    if _mongo_client:
        _mongo_client.close()
        logger.info("MongoDB connection closed.")
    if _redis_client:
        await _redis_client.aclose()
        logger.info("Redis connection closed.")


def get_mongo_db() -> AsyncIOMotorDatabase:
    if _mongo_db is None:
        raise RuntimeError("MongoDB not initialised.")
    return _mongo_db


def get_mongo_client() -> AsyncIOMotorClient:
    if _mongo_client is None:
        raise RuntimeError("MongoDB client not initialised.")
    return _mongo_client


def get_redis() -> aioredis.Redis:
    if _redis_client is None:
        raise RuntimeError("Redis not initialised.")
    return _redis_client


async def db_dependency() -> AsyncIOMotorDatabase:
    return get_mongo_db()


async def redis_dependency() -> aioredis.Redis:
    return get_redis()
