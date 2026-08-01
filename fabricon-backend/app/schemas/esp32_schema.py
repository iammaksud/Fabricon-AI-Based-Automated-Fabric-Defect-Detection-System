"""
Arduino hardware schemas.

Used by POST /api/esp32/action and GET /api/esp32/status. The route paths
and "esp32" naming are kept for API/frontend compatibility even though the
hardware behind them is now an Arduino over USB serial, not an ESP32 over
HTTP -- only the internal transport changed.
"""

from typing import Literal

from pydantic import BaseModel, Field

# The three commands the Arduino firmware understands.
ArduinoCommand = Literal["MOVE_RIGHT", "MOVE_LEFT", "STATUS"]


class ESP32ActionRequest(BaseModel):
    command: ArduinoCommand = Field(
        ...,
        description="Command to send to the Arduino: MOVE_RIGHT, MOVE_LEFT, or STATUS.",
    )


class ESP32ActionResponse(BaseModel):
    success: bool
    command: str
    response: str = Field(..., description="Raw reply line sent back by the Arduino.")


class ESP32StatusResponse(BaseModel):
    connected: bool
    port: str
    response: str = Field(
        ..., description="The Arduino's STATUS reply, or the connection error message."
    )