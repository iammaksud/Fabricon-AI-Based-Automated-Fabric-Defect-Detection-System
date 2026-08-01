"""
History Service.

Router -> HistoryService -> Database

Pure read layer over the Detection table: filtering, pagination, and
single-record lookup. No writes happen here -- detections are created by
detection_service.py during analysis.
"""

import math
from datetime import datetime
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.database.models import Detection


def get_detection_history(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    defect_type: Optional[str] = None,
    detection_status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> Tuple[list[Detection], int]:
    """Retrieves a filtered, paginated, newest-first page of Detection records.

    Args:
        db: Request-scoped SQLAlchemy session.
        page: 1-indexed page number.
        page_size: Number of records per page.
        defect_type: Exact-match filter on Detection.defect_type. Pass
            "" (empty string) or "none"/"clean" is NOT special-cased here --
            only exact matches against stored values are supported, since
            NULL vs. a specific defect name is a query-param ambiguity best
            left to the caller (the router) to resolve if ever needed.
        detection_status: Exact-match filter on Detection.detection_status
            (e.g. "pending", "reviewed", "flagged").
        date_from: Inclusive lower bound on Detection.created_at.
        date_to: Inclusive upper bound on Detection.created_at.

    Returns:
        A tuple of (records_for_this_page, total_matching_record_count).
    """
    query = db.query(Detection)

    if defect_type is not None:
        query = query.filter(Detection.defect_type == defect_type)

    if detection_status is not None:
        query = query.filter(Detection.detection_status == detection_status)

    if date_from is not None:
        query = query.filter(Detection.created_at >= date_from)

    if date_to is not None:
        query = query.filter(Detection.created_at <= date_to)

    total = query.count()

    records = (
        query.order_by(Detection.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return records, total


def get_total_pages(total: int, page_size: int) -> int:
    """Computes total page count for the given total record count and page size."""
    if total == 0:
        return 0
    return math.ceil(total / page_size)


def get_detection_by_id(db: Session, detection_id: int) -> Optional[Detection]:
    """Retrieves a single Detection record by primary key, or None if not found."""
    return db.query(Detection).filter(Detection.id == detection_id).first()