"""
Settings router.

GET /api/settings/status -> current aggregate system status (with sensible
                             defaults for any key that has no row yet)
PUT /api/settings/status -> update a single system status value, then
                             returns the refreshed aggregate status
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Admin
from app.schemas.settings_schema import SystemStatusResponse, SystemStatusUpdateRequest
from app.services.auth_service import get_current_admin
from app.services.settings_service import (
    SettingsValidationError,
    get_system_status,
    update_system_status,
)

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get(
    "/status",
    response_model=SystemStatusResponse,
    summary="Get System Status",
    description=(
        "Returns the current AI/ESP32/camera status and system mode. Any status "
        "key that has never been set falls back to a sensible default."
    ),
)
def get_status(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Protected endpoint: retrieves the current aggregate system status."""
    return get_system_status(db)


@router.put(
    "/status",
    response_model=SystemStatusResponse,
    summary="Update System Status",
    description=(
        "Updates a single system status value (key_name must be one of: "
        "ai_status, esp32_status, camera_status, system_mode). Returns the "
        "refreshed aggregate status."
    ),
)
def put_status(
    payload: SystemStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Protected endpoint: upserts one status key/value pair, then returns the full status."""
    try:
        update_system_status(db, key_name=payload.key_name, value=payload.value)
    except SettingsValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc

    return get_system_status(db)