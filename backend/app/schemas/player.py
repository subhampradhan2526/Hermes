from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class PlayerBase(BaseModel):
    tracker_id: int
    team_id: Optional[int] = None
    jersey_number: Optional[str] = "N/A"
    name: Optional[str] = None
    position: Optional[str] = "Field Player"
    is_goalkeeper: bool = False


class PlayerCreate(PlayerBase):
    match_id: str


class PlayerTrackingPoint(BaseModel):
    frame_idx: int
    timestamp_seconds: float
    x: float  # Normalized 0..1
    y: float  # Normalized 0..1
    speed_kmh: Optional[float] = 0.0
    distance_covered_m: Optional[float] = 0.0
    bbox_norm: Optional[List[float]] = None


class PlayerStatisticResponse(BaseModel):
    player_id: str
    tracker_id: int
    team_id: Optional[int] = None
    name: Optional[str] = None
    jersey_number: str = "N/A"
    position: str = "Field Player"
    distance_covered_m: float = 0.0
    top_speed_kmh: float = 0.0
    avg_speed_kmh: float = 0.0
    minutes_played: float = 0.0
    ball_involvement_rate: float = 0.0
    sprints_count: int = 0
    # Explicitly labeled metrics that are NOT provided by the vision model
    passes: str = "Not available from current model"
    pass_accuracy: str = "Not available from current model"
    shots: str = "Not available from current model"
    goals: str = "Not available from current model"
    assists: str = "Not available from current model"
    fouls: str = "Not available from current model"


class PlayerHeatmapPoint(BaseModel):
    x: float  # 0..1
    y: float  # 0..1
    weight: float = 1.0


class PlayerHeatmapResponse(BaseModel):
    player_id: str
    tracker_id: int
    team_id: Optional[int] = None
    total_points: int
    points: List[PlayerHeatmapPoint]


class PlayerResponse(PlayerBase):
    id: str
    match_id: str
    created_at: datetime
    statistics: Optional[PlayerStatisticResponse] = None

    class Config:
        from_attributes = True
