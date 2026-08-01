"""
History router.

GET /api/history                -> paginated, filterable list of detections, newest first
GET /api/history/{detection_id} -> a single detection record by id
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Admin
from app.schemas.history_schema import HistoryItem, PaginatedHistoryResponse
from app.services.auth_service import get_current_admin
from app.services.history_service import (
    get_detection_by_id,
    get_detection_history,
    get_total_pages,
)

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get(
    "",
    response_model=PaginatedHistoryResponse,
    summary="List Detection History",
    description=(
        "Returns a paginated, newest-first list of detection records, optionally "
        "filtered by defect type, detection status, and/or a created_at date range."
    ),
)
def list_history(
    page: int = Query(default=1, ge=1, description="1-indexed page number."),
    page_size: int = Query(default=20, ge=1, le=100, description="Records per page."),
    defect_type: Optional[str] = Query(
        default=None, description="Filter by exact defect type (e.g. 'Hole', 'Stain')."
    ),
    detection_status: Optional[str] = Query(
        default=None, description="Filter by exact detection status (e.g. 'pending', 'reviewed')."
    ),
    date_from: Optional[datetime] = Query(
        default=None, description="Only include detections created on/after this timestamp."
    ),
    date_to: Optional[datetime] = Query(
        default=None, description="Only include detections created on/before this timestamp."
    ),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Protected endpoint: retrieves detection history with filtering and pagination."""
    records, total = get_detection_history(
        db,
        page=page,
        page_size=page_size,
        defect_type=defect_type,
        detection_status=detection_status,
        date_from=date_from,
        date_to=date_to,
    )

    return PaginatedHistoryResponse(
        items=[HistoryItem.model_validate(record) for record in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=get_total_pages(total, page_size),
    )


@router.get(
    "/{detection_id}",
    response_model=HistoryItem,
    summary="Get Detection By ID",
    description="Returns a single detection record by its id.",
)
def get_history_item(
    detection_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    """Protected endpoint: retrieves one detection record, or 404 if it doesn't exist."""
    record = get_detection_by_id(db, detection_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Detection with id {detection_id} was not found.",
        )
    return record