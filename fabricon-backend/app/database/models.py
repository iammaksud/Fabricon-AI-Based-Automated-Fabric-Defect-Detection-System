from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Float,
    Boolean,
    DateTime,
    Text,
    JSON,
    ForeignKey,
    func
)
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="admin", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    reviewed_detections = relationship("Detection", back_populates="reviewer")


class Detection(Base):
    __tablename__ = "detections"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    batch_number = Column(String(100), nullable=True, index=True)
    # NULL = no defect found (clean fabric). Non-null = defect type name
    # (e.g. "Hole", "Stain"). This is the single source of truth for
    # "was this a defect" — no magic strings required.
    defect_type = Column(String(100), nullable=True, index=True)
    confidence = Column(Float, nullable=False)
    bounding_boxes = Column(JSON, nullable=True)  # Roboflow detection coordinates
    inference_time_ms = Column(Float, nullable=True)
    image_path = Column(String(500), nullable=True)
    
    # Frontend tracking and hardware trigger action fields
    detection_status = Column(String(50), default="pending", nullable=False, index=True)
    esp32_action = Column(String(50), nullable=True)  # e.g., "STOP_BELT", "ALARM", "FLAG", "NONE"
    
    reviewer_notes = Column(Text, nullable=True)
    device_id = Column(String(100), nullable=True, index=True)
    
    # Foreign key link to Admin who reviewed/overrode this detection
    reviewed_by_id = Column(
        BigInteger,
        ForeignKey("admins.id", ondelete="SET NULL"),
        nullable=True
    )
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    # Relationships
    reviewer = relationship("Admin", back_populates="reviewed_detections")


class ESP32Log(Base):
    __tablename__ = "esp32_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    device_id = Column(String(100), nullable=False, index=True)
    conveyor_speed = Column(Float, nullable=True)
    frame_rate = Column(Float, nullable=True)
    log_level = Column(String(20), default="INFO", nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )


class SystemStatus(Base):
    __tablename__ = "system_status"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    key_name = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )