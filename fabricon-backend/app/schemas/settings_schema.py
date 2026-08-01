"""
Settings schemas.

Defines the request/response shapes for:
  GET /api/settings/status -> current aggregate system status
  PUT /api/settings/status -> update a single system status value

Backed by the generic SystemStatus key-value table (key_name, value,
updated_at). This module only recognizes a fixed set of status keys --
see settings_service.STATUS_KEYS.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SystemStatusResponse(BaseModel):
    """Schema for the current aggregate system status."""

    ai_status: str = Field(..., description="Roboflow/AI service status, e.g. 'ONLINE' or 'OFFLINE'.")
    esp32_status: str = Field(..., description="ESP32 connection status, e.g. 'CONNECTED' or 'DISCONNECTED'.")
    camera_status: str = Field(..., description="Camera status, e.g. 'ONLINE' or 'OFFLINE'.")
    system_mode: str = Field(..., description="Overall system mode, e.g. 'IDLE', 'RUNNING', 'MAINTENANCE'.")
    last_updated: Optional[datetime] = Field(
        default=None,
        description="Most recent updated_at across the known status keys, or null if none are set yet.",
    )


class SystemStatusUpdateRequest(BaseModel):
    """Schema for PUT /api/settings/status."""

    key_name: str = Field(
        ..., description="Which status field to update: ai_status, esp32_status, camera_status, or system_mode."
    )
    value: str = Field(..., description="The new value for the given key_name.")
