from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class AnalysisJobCreate(BaseModel):
    match_id: str
    video_id: str
    model_name: Optional[str] = "existing_pipeline"
    mode: Optional[str] = "RADAR"  # 'RADAR', 'PLAYER_DETECTION', 'PITCH_DETECTION', 'BALL_DETECTION', 'PLAYER_TRACKING', 'TEAM_CLASSIFICATION'
    max_frames: Optional[int] = None
    device: Optional[str] = None  # None for auto-detect (mps/cpu)


class AnalysisStatusResponse(BaseModel):
    analysis_id: str
    match_id: str
    video_id: str
    model_name: str
    mode: str
    status: str  # 'pending', 'processing', 'completed', 'failed'
    stage: str   # 'preparing', 'player_detection', 'tracking', etc.
    progress: int  # 0..100
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_frames_analyzed: int = 0
    results_summary: Optional[Dict[str, Any]] = None


class VideoUploadResponse(BaseModel):
    video_id: str
    filename: str
    file_size: int
    duration: float
    fps: float
    width: int
    height: int
    video_url: str


class DetectionItem(BaseModel):
    bbox: List[float]  # [x1, y1, x2, y2]
    bbox_norm: List[float]  # [norm_x1, norm_y1, norm_x2, norm_y2]
    class_id: int
    class_name: str
    confidence: float
    tracker_id: Optional[int] = None
    team_id: Optional[int] = None


class RadarPoint(BaseModel):
    x: float  # Normalized 0..1
    y: float  # Normalized 0..1
    team_id: int
    tracker_id: Optional[int] = None


class BallPoint(BaseModel):
    x: float
    y: float
    norm_x: float
    norm_y: float
    pitch_x: Optional[float] = None
    pitch_y: Optional[float] = None
    confidence: Optional[float] = None


class FramePredictionResponse(BaseModel):
    frame_idx: int
    timestamp_seconds: float
    detections: List[DetectionItem]
    ball: Optional[BallPoint] = None
    radar_points: Optional[List[RadarPoint]] = None
    in_possession_team: Optional[int] = None
