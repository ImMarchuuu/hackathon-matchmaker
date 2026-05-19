from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.db import close_db_connections, init_db_connections


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db_connections()
    yield
    await close_db_connections()


def create_app() -> FastAPI:
    application = FastAPI(
        title="Hackathon Matchmaking API",
        description="Connect builders, designers, and innovators for hackathons.",
        version="0.1.0",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from app.api.v1.health import router as health_router
    from app.api.v1.users import router as users_router
    from app.api.v1.teams import router as teams_router

    application.include_router(health_router, prefix="/api/v1")
    application.include_router(users_router, prefix="/api/v1")
    application.include_router(teams_router, prefix="/api/v1")

    return application


app = create_app()


@app.get("/", include_in_schema=False)
async def root() -> JSONResponse:
    return JSONResponse({"message": "Hackathon Matchmaking API — visit /docs"})
