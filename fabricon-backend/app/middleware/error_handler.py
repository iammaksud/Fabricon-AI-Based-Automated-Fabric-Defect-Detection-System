"""
Global exception handling.

Ensures unhandled exceptions return a consistent JSON error shape
instead of leaking a raw traceback to the client. This is
infrastructure (how errors LOOK), not feature-specific business logic.
"""

import logging

from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse

logger = logging.getLogger("fabricon")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "An unexpected error occurred.",
            },
        )
