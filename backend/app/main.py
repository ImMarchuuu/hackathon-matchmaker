from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.core.db import close_db_connections, get_redis, init_db_connections
from app.services.rank import seed_thresholds


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_connections()
    await seed_thresholds(get_redis())
    yield
    await close_db_connections()


def create_app() -> FastAPI:
    application = FastAPI(
        title="Hackathon Matchmaking API",
        description="Connect builders, designers, and innovators for hackathons.",
        version="0.1.0",
        lifespan=lifespan,
    )

    # SessionMiddleware must come before CORSMiddleware so OAuth state is
    # available in the session during the callback request.
    application.add_middleware(SessionMiddleware, secret_key=settings.session_secret)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from app.api.v1.health import router as health_router
    from app.api.v1.auth import router as auth_router
    from app.api.v1.users import router as users_router
    from app.api.v1.teams import router as teams_router
    from app.api.v1.catalog import router as catalog_router

    application.include_router(health_router, prefix="/api/v1")
    application.include_router(auth_router, prefix="/api/v1")
    application.include_router(users_router, prefix="/api/v1")
    application.include_router(teams_router, prefix="/api/v1")
    application.include_router(catalog_router, prefix="/api/v1")

    uploads_dir = Path("/app/uploads")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    application.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

    return application


app = create_app()


@app.get("/", include_in_schema=False)
async def root() -> JSONResponse:
    return JSONResponse({"message": "Hackathon Matchmaking API — visit /docs"})
