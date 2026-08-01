"""
Arduino hardware router.

Kept at the historical /api/esp32 prefix and route names for
frontend/API compatibility -- only the internal transport changed, from
a planned ESP32-over-HTTP integration to an Arduino-over-USB-serial one.

POST /api/esp32/action -- manually send one command (mainly for testing
                           the serial link and the motor without running
                           a full detection).
GET  /api/esp32/status -- reports whether the Arduino is currently
                           reachable over serial.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.database.models import Admin
from app.schemas.esp32_schema import (
    ESP32ActionRequest,
    ESP32ActionResponse,
    ESP32StatusResponse,
)
from app.services import esp32_service
from app.services.auth_service import get_current_admin
from app.services.esp32_service import ArduinoConnectionError

logger = logging.getLogger("fabricon.esp32_router")

router = APIRouter(prefix="/api/esp32", tags=["Hardware (Arduino)"])


@router.post(
    "/action",
    response_model=ESP32ActionResponse,
    summary="Send a manual command to the Arduino",
)
def send_action(
    payload: ESP32ActionRequest,
    current_admin: Admin = Depends(get_current_admin),
):
    """Sends MOVE_RIGHT / MOVE_LEFT / STATUS directly to the Arduino.

    Useful for testing the serial connection and motor independently of
    running an actual fabric detection.
    """
    try:
        result = esp32_service.send_command(payload.command)
    except ArduinoConnectionError as exc:
        logger.error("Manual Arduino command '%s' failed: %s", payload.command, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        ) from exc

    return ESP32ActionResponse(
        success=True, command=result["command"], response=result["response"]
    )


@router.get(
    "/status",
    response_model=ESP32StatusResponse,
    summary="Check whether the Arduino is connected",
)
def get_status(current_admin: Admin = Depends(get_current_admin)):
    """Pings the Arduino over serial and reports connection health.

    Always returns 200 -- an unplugged/unreachable Arduino is reported as
    `connected: false`, not treated as a server error.
    """
    return ESP32StatusResponse(**esp32_service.get_esp32_status())