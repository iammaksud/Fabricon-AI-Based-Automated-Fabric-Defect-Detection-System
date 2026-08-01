"""
History schemas.

Defines the response shapes for:
  GET /api/history                -> paginated, filterable list of detections
  GET /api/history/{detection_id} -> a single detection record

HistoryItem mirrors dashboard_schema.RecentActivityItem but also includes
bounding_boxes, per this module's requirements.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class HistoryItem(BaseModel):
    """Schema for a single detection record returned by the History API."""

    id: int
    defect_type: Optional[str] = None
    confidence: float
    bounding_boxes: Optional[List[Dict[str, Any]]] = None
    image_path: Optional[str] = None
    detection_status: str
    device_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedHistoryResponse(BaseModel):
    """Schema for GET /api/history — a page of detection records plus paging metadata."""

    items: List[HistoryItem] = Field(default_factory=list)
    total: int = Field(..., description="Total number of records matching the current filters.")
    page: int = Field(..., description="Current page number (1-indexed).")
    page_size: int = Field(..., description="Number of records requested per page.")
    total_pages: int = Field(..., description="Total number of pages available for these filters.")