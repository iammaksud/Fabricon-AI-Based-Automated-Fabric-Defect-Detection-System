from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class DashboardStatsResponse(BaseModel):
    """Schema for dashboard aggregate statistics."""
    total_detections: int = 0
    total_defects: int = 0
    total_normal: int = 0
    today_detections: int = 0
    ai_status: str = "OFFLINE"
    esp32_status: str = "DISCONNECTED"


class RecentActivityItem(BaseModel):
    """Schema for individual recent detection records."""
    id: int
    batch_number: Optional[str] = None
    defect_type: Optional[str] = None
    confidence: float
    image_path: Optional[str] = None
    detection_status: str
    esp32_action: Optional[str] = None
    device_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecentActivityResponse(BaseModel):
    """Schema for recent activity list response."""
    recent_activities: List[RecentActivityItem] = []