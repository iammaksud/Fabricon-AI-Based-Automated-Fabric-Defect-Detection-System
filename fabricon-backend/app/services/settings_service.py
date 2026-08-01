"""
Settings Service.

Router -> SettingsService -> Database

Reads and writes the generic key-value SystemStatus table for a fixed set
of recognized runtime status keys (STATUS_KEYS below). No ESP32/camera
hardware communication happens here -- this module only manages the
*recorded* status values in MySQL, which other parts of the system
(esp32_service, a future camera integration, etc.) are expected to update
as their own real state changes.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.database.models import SystemStatus

# The only status keys this module recognizes. Keeping this as a fixed set
# (rather than accepting arbitrary key_name values) prevents the
# system_status table from silently accumulating typos or unrelated keys.
STATUS_KEYS = {"ai_status", "esp32_status", "camera_status", "system_mode"}

# Sensible defaults returned when a given key has no row yet -- e.g. right
# after a fresh install, before anything has ever reported its status.
DEFAULT_STATUS_VALUES = {
    "ai_status": "ONLINE",
    "esp32_status": "DISCONNECTED",
    "camera_status": "OFFLINE",
    "system_mode": "IDLE",
}


class SettingsValidationError(Exception):
    """Raised when a settings update is rejected (e.g. an unrecognized key_name)."""


def get_system_status(db: Session) -> dict:
    """Retrieves the current aggregate system status.

    For each key in STATUS_KEYS, uses the stored SystemStatus value if a
    row exists, otherwise falls back to DEFAULT_STATUS_VALUES so the
    response is always complete even on a brand-new database.

    Returns:
        A dict with keys: ai_status, esp32_status, camera_status,
        system_mode, last_updated (the most recent updated_at among the
        rows that actually exist, or None if none of the 4 keys have ever
        been written).
    """
    records = (
        db.query(SystemStatus).filter(SystemStatus.key_name.in_(STATUS_KEYS)).all()
    )
    records_by_key = {record.key_name: record for record in records}

    status = {
        key: (records_by_key[key].value if key in records_by_key else DEFAULT_STATUS_VALUES[key])
        for key in STATUS_KEYS
    }

    last_updated: Optional[datetime] = None
    if records:
        last_updated = max(record.updated_at for record in records)

    status["last_updated"] = last_updated
    return status


def update_system_status(db: Session, key_name: str, value: str) -> SystemStatus:
    """Creates or updates a single SystemStatus row (upsert by key_name).

    Args:
        db: Request-scoped SQLAlchemy session.
        key_name: Must be one of STATUS_KEYS.
        value: The new value to store for that key.

    Returns:
        The saved SystemStatus row.

    Raises:
        SettingsValidationError: if key_name isn't one of the recognized
            status keys.
    """
    if key_name not in STATUS_KEYS:
        raise SettingsValidationError(
            f"Unrecognized key_name '{key_name}'. Must be one of: {', '.join(sorted(STATUS_KEYS))}."
        )

    record = db.query(SystemStatus).filter(SystemStatus.key_name == key_name).first()

    if record is None:
        record = SystemStatus(key_name=key_name, value=value)
        db.add(record)
    else:
        record.value = value  # updated_at is refreshed automatically via onupdate

    db.commit()
    db.refresh(record)
    return record