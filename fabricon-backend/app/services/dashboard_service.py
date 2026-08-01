from datetime import datetime, timezone
from typing import List
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.models import Detection, ESP32Log, SystemStatus
from app.schemas.dashboard_schema import DashboardStatsResponse, RecentActivityItem


def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
    """Calculates summary metrics across Detections, ESP32 logs, and SystemStatus."""
    # 1. Total detections count
    total_detections = db.query(func.count(Detection.id)).scalar() or 0

    # 2. Defect vs. Normal counts
    # A clean/normal detection has defect_type = NULL (see models.py).
    total_normal = (
        db.query(func.count(Detection.id))
        .filter(Detection.defect_type.is_(None))
        .scalar() or 0
    )
    total_defects = total_detections - total_normal

    # 3. Today's detections
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_detections = (
        db.query(func.count(Detection.id))
        .filter(Detection.created_at >= today_start)
        .scalar() or 0
    )

    # 4. Check AI Status from SystemStatus table (default to 'ONLINE' if system configured)
    ai_status_record = (
        db.query(SystemStatus)
        .filter(SystemStatus.key_name == "ai_status")
        .first()
    )
    ai_status = ai_status_record.value if ai_status_record else "ONLINE"

    # 5. Check ESP32 Status from latest log (e.g. active within last 5 mins)
    latest_log = (
        db.query(ESP32Log)
        .order_by(ESP32Log.created_at.desc())
        .first()
    )
    if latest_log:
        time_diff = (datetime.now(timezone.utc) - latest_log.created_at.replace(tzinfo=timezone.utc)).total_seconds()
        esp32_status = "CONNECTED" if time_diff < 300 else "DISCONNECTED"
    else:
        esp32_status = "DISCONNECTED"

    return DashboardStatsResponse(
        total_detections=total_detections,
        total_defects=total_defects,
        total_normal=total_normal,
        today_detections=today_detections,
        ai_status=ai_status,
        esp32_status=esp32_status,
    )


def get_recent_activity(db: Session, limit: int = 10) -> List[RecentActivityItem]:
    """Retrieves the latest detection records ordered by creation time."""
    records = (
        db.query(Detection)
        .order_by(Detection.created_at.desc())
        .limit(limit)
        .all()
    )
    return [RecentActivityItem.model_validate(record) for record in records]