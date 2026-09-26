from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MatchBase(BaseModel):
    title: str
    team_a_name: str = "Team Red"
    team_b_name: str = "Team Blue"
    team_a_color: str = "#FF1493"
    team_b_color: str = "#00BFFF"
    score_a: Optional[int] = None
    score_b: Optional[int] = None
    date: Optional[str] = None
    venue: Optional[str] = "Football Arena"
    is_demo: bool = False


class MatchCreate(MatchBase):
    video_id: Optional[str] = None


class MatchUpdate(BaseModel):
    title: Optional[str] = None
    score_a: Optional[int] = None
    score_b: Optional[int] = None
    status: Optional[str] = None


class MatchResponse(MatchBase):
    id: str
    status: str
    video_id: Optional[str] = None
    created_at: datetime
    players_count: Optional[int] = 0
    events_count: Optional[int] = 0
    latest_job_id: Optional[str] = None
    latest_job_status: Optional[str] = None
    latest_job_progress: Optional[int] = 0

    class Config:
        from_attributes = True


class MatchDetailResponse(MatchResponse):
    video_url: Optional[str] = None
    video_duration: Optional[float] = 0.0
    video_fps: Optional[float] = 25.0
    video_width: Optional[int] = 1920
    video_height: Optional[int] = 1080
    statistics_summary: Optional[Dict[str, Any]] = None
