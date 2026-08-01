"""
Fabricon Backend — Application Entrypoint.

Wires together: settings, CORS, custom middleware, all routers, and a
health check endpoint. No business logic lives here — this file's only
job is composition and startup. Auth logic itself lives in
services/auth_service.py, not here.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import init_db
from app.middleware.error_handler import register_error_handlers
from app.middleware.logging_middleware import LoggingMiddleware

from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.detection import router as detection_router
from app.routers.history import router as history_router
from app.routers.esp32 import router as esp32_router
from app.routers.settings import router as settings_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fabricon")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---------------- Startup ----------------
    logger.info("%s v%s starting up in '%s' mode", settings.APP_NAME, settings.APP_VERSION, settings.APP_ENV)
    logger.info("CORS allowed origins: %s", settings.cors_origins_list)

    # Seeds a default admin (admin@fabricon.com / admin123) if none exists.
    # init_db() handles its own DB errors internally and won't crash startup
    # if MySQL isn't reachable yet.
    init_db()

    yield

    # ---------------- Shutdown ----------------
    logger.info("%s shutting down.", settings.APP_NAME)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="AI-Based Automated Fabric Defect Detection System — Backend API",
        lifespan=lifespan,
    )

    # ---------------- CORS ----------------
    # Allows the React (Vite) frontend to call this API from a different origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---------------- Custom middleware ----------------
    app.add_middleware(LoggingMiddleware)
    register_error_handlers(app)

    # ---------------- Routers ----------------
    app.include_router(auth_router)
    app.include_router(dashboard_router)
    app.include_router(detection_router)
    app.include_router(history_router)
    app.include_router(esp32_router)
    app.include_router(settings_router)

    # ---------------- Health check ----------------
    @app.get("/health", tags=["Health"])
    def health_check():
        """Basic liveness endpoint — confirms the API process is running.
        Does not require the database to be reachable."""
        return {
            "status": "ok",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
        }

    return app


app = create_app()
