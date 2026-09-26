from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel


class EventBase(BaseModel):
    timestamp_seconds: float
    frame_idx: int
    event_type: str  # 'Possession Change', 'Box Entry', 'High Speed Run', etc.
    player_id: Optional[str] = None
    tracker_id: Optional[int] = None
    team_id: Optional[int] = None
    x_pitch: Optional[float] = None
    y_pitch: Optional[float] = None
    confidence: Optional[float] = None
    is_model_detection: bool = False
    is_calculated_statistic: bool = True
    details: Optional[Dict[str, Any]] = None


class EventCreate(EventBase):
    match_id: str
    job_id: Optional[str] = None


class EventResponse(EventBase):
    id: str
    match_id: str
    job_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
