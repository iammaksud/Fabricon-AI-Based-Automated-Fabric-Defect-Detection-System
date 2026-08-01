"""
Detection schemas.

DetectionAnalyzeResponse wraps two things returned by
POST /api/detection/analyze:
  - `prediction`: the complete, unmodified Roboflow response (raw dict --
    shape depends on the model, intentionally not reshaped anywhere in this
    pipeline so no information is lost before it reaches the client).
  - `detection`: the Detection row that was actually saved to MySQL,
    reflecting how the raw prediction was interpreted and persisted.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class DetectionRecordResponse(BaseModel):
    """Schema for a saved Detection row, as returned by the analyze endpoint."""

    id: int
    batch_number: Optional[str] = None
    defect_type: Optional[str] = None
    confidence: float
    bounding_boxes: Optional[List[Dict[str, Any]]] = None
    inference_time_ms: Optional[float] = None
    image_path: Optional[str] = None
    detection_status: str
    device_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DetectionAnalyzeResponse(BaseModel):
    """Response schema for POST /api/detection/analyze."""

    success: bool = True
    filename: str = Field(..., description="Original filename of the uploaded image.")
    prediction: Dict[str, Any] = Field(
        ..., description="Raw, unmodified prediction response from Roboflow."
    )
    detection: DetectionRecordResponse = Field(
        ..., description="The Detection record saved to the database for this analysis."
    )