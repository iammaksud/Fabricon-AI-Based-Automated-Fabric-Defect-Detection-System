from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Admin
from app.schemas.dashboard_schema import DashboardStatsResponse, RecentActivityResponse
from app.services.auth_service import get_current_admin
from app.services.dashboard_service import get_dashboard_stats, get_recent_activity

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    summary="Get Dashboard Statistics",
    description="Returns aggregate counts for detections, defects, clean fabric frames, and device statuses."
)
def get_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Returns real-time or aggregated system operational metrics."""
    return get_dashboard_stats(db)


@router.get(
    "/recent-activity",
    response_model=RecentActivityResponse,
    summary="Get Recent Activity Log",
    description="Returns recent fabric detection entries for feed populating."
)
def get_recent(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Retrieves recent fabric inspection records."""
    activities = get_recent_activity(db, limit=limit)
    return RecentActivityResponse(recent_activities=activities)