"""
Arduino Hardware Service.

Historically named for the ESP32 (HTTP) integration that was originally
planned; the hardware layer has since moved to an Arduino connected over
USB serial, so this module now speaks Serial instead of HTTP. The public
functions and their responsibilities are unchanged from what the rest of
the app expects: report connection status, and trigger a reject/accept
action after each detection.

Wiring:
    Laptop (FastAPI) --USB Serial--> Arduino --> Motor Driver --> DC Motor

Commands understood by the Arduino firmware (see fabricon-arduino/
fabricon_motor_controller.ino):
    MOVE_RIGHT  -- defect found: route the fabric right
    MOVE_LEFT   -- normal fabric: route it left
    STATUS      -- health check, Arduino replies with "READY"

One serial connection is opened lazily and reused across requests/calls
(reopening a serial port resets most Arduino boards, which would be slow
and would drop the board back into its setup() routine on every request).
"""

import logging
import threading
from typing import Optional

import serial
from serial import SerialException

from app.core.config import settings

logger = logging.getLogger("fabricon.esp32_service")

# Guards the module-level connection singleton -- only one thread may
# open/reset/use the serial port at a time.
_lock = threading.Lock()
_connection: Optional[serial.Serial] = None

COMMAND_TERMINATOR = "\n"
READ_TIMEOUT_SECONDS = 2
SERIAL_SETTLE_SECONDS = 2  # Arduino resets on connect; give it time to boot


class ArduinoConnectionError(Exception):
    """Raised when the Arduino can't be reached over serial.

    Covers: wrong/missing COM port, port already in use, or the board not
    responding within the read timeout. Callers that must not fail hard
    (the detection pipeline) catch this themselves rather than letting it
    propagate.
    """


def _open_connection() -> serial.Serial:
    """Opens a fresh serial connection to ARDUINO_PORT, or raises ArduinoConnectionError."""
    try:
        connection = serial.Serial(
            port=settings.ARDUINO_PORT,
            baudrate=settings.BAUD_RATE,
            timeout=READ_TIMEOUT_SECONDS,
        )
    except SerialException as exc:
        raise ArduinoConnectionError(
            f"Could not open Arduino on port '{settings.ARDUINO_PORT}': {exc}"
        ) from exc

    return connection


def _get_connection() -> serial.Serial:
    """Returns the shared serial connection, opening it on first use."""
    global _connection

    with _lock:
        if _connection is not None and _connection.is_open:
            return _connection

        _connection = _open_connection()
        return _connection


def _drop_connection() -> None:
    """Closes and clears the cached connection so the next call reconnects from scratch."""
    global _connection

    with _lock:
        if _connection is not None:
            try:
                _connection.close()
            except SerialException:
                pass
        _connection = None


def _send_command(command: str) -> str:
    """Sends one command line to the Arduino and returns its reply, stripped of whitespace.

    Raises ArduinoConnectionError if the port can't be opened, the write
    fails, or the Arduino doesn't reply within READ_TIMEOUT_SECONDS.
    """
    try:
        connection = _get_connection()
        connection.reset_input_buffer()
        connection.write(f"{command}{COMMAND_TERMINATOR}".encode("utf-8"))
        connection.flush()

        raw_response = connection.readline()
        response = raw_response.decode("utf-8", errors="ignore").strip()

        if not response:
            raise ArduinoConnectionError(
                f"Arduino did not respond to '{command}' within "
                f"{READ_TIMEOUT_SECONDS}s (check the wiring, COM port, and baud rate)."
            )

        return response

    except SerialException as exc:
        # The connection died mid-write/read (e.g. the board was
        # unplugged). Drop the stale handle so the *next* call attempts a
        # clean reconnect instead of repeatedly failing on a dead handle.
        _drop_connection()
        raise ArduinoConnectionError(f"Lost connection to Arduino: {exc}") from exc


def send_command(command: str) -> dict:
    """Sends a single raw command (MOVE_RIGHT / MOVE_LEFT / STATUS) to the Arduino.

    Used directly by POST /api/esp32/action for manual/testing use. Raises
    ArduinoConnectionError on failure -- the router maps that to a 502.
    """
    response = _send_command(command)
    return {"command": command, "response": response}


def get_esp32_status() -> dict:
    """Pings the Arduino with STATUS and reports whether it's reachable.

    Never raises: hardware being unplugged is an expected, normal state
    for this endpoint to report (connected: False), not a server error.
    """
    try:
        response = _send_command("STATUS")
        return {"connected": True, "port": settings.ARDUINO_PORT, "response": response}
    except ArduinoConnectionError as exc:
        logger.warning("Arduino status check failed: %s", exc)
        return {"connected": False, "port": settings.ARDUINO_PORT, "response": str(exc)}


def trigger_reject() -> dict:
    """Sends MOVE_RIGHT -- the 'reject/defect' motor action.

    Kept as its own function (rather than inlining send_command calls
    everywhere) since this is the one hardware action the detection
    pipeline itself calls after every defect prediction.
    """
    return send_command("MOVE_RIGHT")


def trigger_accept() -> dict:
    """Sends MOVE_LEFT -- the 'accept/normal' motor action."""
    return send_command("MOVE_LEFT")


def trigger_action_for_detection(is_defect: bool) -> str:
    """Called by the detection pipeline immediately after AI inference.

    Sends the matching motor command to the Arduino and returns the label
    to store in Detection.esp32_action -- "DEFECT_RIGHT" or "NORMAL_LEFT"
    -- regardless of whether the Arduino is actually connected right now.
    Hardware being offline must never block or fail a detection save; the
    error is logged and the detection is still recorded with the intended
    action.
    """
    action_label = "DEFECT_RIGHT" if is_defect else "NORMAL_LEFT"

    try:
        trigger_reject() if is_defect else trigger_accept()
    except ArduinoConnectionError as exc:
        logger.warning(
            "Could not send '%s' to Arduino (detection was still saved): %s",
            action_label,
            exc,
        )

    return action_label