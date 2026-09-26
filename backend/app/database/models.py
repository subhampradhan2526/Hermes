import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


class Video(Base):
    __tablename__ = "videos"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=True)
    filepath = Column(String(512), nullable=False)
    status = Column(String(50), default="uploaded")
    file_size = Column(Integer, default=0)
    duration = Column(Float, default=0.0)
    fps = Column(Float, default=25.0)
    width = Column(Integer, default=1920)
    height = Column(Integer, default=1080)
    total_frames = Column(Integer, default=0)
    is_sample = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    matches = relationship("Match", back_populates="video", cascade="all, delete-orphan")
    analysis_jobs = relationship("AnalysisJob", back_populates="video", cascade="all, delete-orphan")


class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    team_a_name = Column(String(100), default="Team Red")
    team_b_name = Column(String(100), default="Team Blue")
    team_a_color = Column(String(30), default="#FF1493")
    team_b_color = Column(String(30), default="#00BFFF")
    score_a = Column(Integer, nullable=True)
    score_b = Column(Integer, nullable=True)
    date = Column(String(50), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    venue = Column(String(100), default="Football Arena")
    status = Column(String(50), default="ready")  # 'ready', 'analyzing', 'completed', 'failed'
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    video_id = Column(String(36), ForeignKey("videos.id"), nullable=True)
    video = relationship("Video", back_populates="matches")

    players = relationship("Player", back_populates="match", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="match", cascade="all, delete-orphan")
    analysis_jobs = relationship("AnalysisJob", back_populates="match", cascade="all, delete-orphan")
    player_statistics = relationship("PlayerStatistic", back_populates="match", cascade="all, delete-orphan")


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    match_id = Column(String(36), ForeignKey("matches.id"), nullable=False)
    video_id = Column(String(36), ForeignKey("videos.id"), nullable=False)
    model_name = Column(String(100), default="existing_pipeline")  # 'existing_pipeline' or 'custom_model'
    mode = Column(String(50), default="RADAR")  # 'RADAR', 'PLAYER_DETECTION', etc.
    status = Column(String(50), default="pending")  # 'pending', 'processing', 'completed', 'failed'
    stage = Column(String(100), default="preparing")  # 'preparing', 'player_detection', 'tracking', etc.
    progress = Column(Integer, default=0)  # 0 to 100
    error_message = Column(Text, nullable=True)
    result_video_path = Column(String(512), nullable=True)
    radar_video_path = Column(String(512), nullable=True)
    total_frames_analyzed = Column(Integer, default=0)
    results_summary = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match", back_populates="analysis_jobs")
    video = relationship("Video", back_populates="analysis_jobs")
    frame_predictions = relationship("FramePrediction", back_populates="job", cascade="all, delete-orphan")
    player_trackings = relationship("PlayerTracking", back_populates="job", cascade="all, delete-orphan")


class Player(Base):
    __tablename__ = "players"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    match_id = Column(String(36), ForeignKey("matches.id"), nullable=False)
    tracker_id = Column(Integer, nullable=False)
    team_id = Column(Integer, nullable=True)  # 0: Team A, 1: Team B, 2: Referee
    jersey_number = Column(String(10), default="N/A")
    name = Column(String(100), nullable=True)
    position = Column(String(50), default="Field Player")
    is_goalkeeper = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match", back_populates="players")
    trackings = relationship("PlayerTracking", back_populates="player", cascade="all, delete-orphan")
    statistics = relationship("PlayerStatistic", back_populates="player", cascade="all, delete-orphan")


class PlayerTracking(Base):
    __tablename__ = "player_trackings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("analysis_jobs.id"), nullable=False)
    player_id = Column(String(36), ForeignKey("players.id"), nullable=True)
    tracker_id = Column(Integer, nullable=False)
    team_id = Column(Integer, nullable=True)
    frame_idx = Column(Integer, nullable=False)
    timestamp_seconds = Column(Float, nullable=False)
    x_pitch = Column(Float, nullable=False)  # Normalized 0..1
    y_pitch = Column(Float, nullable=False)  # Normalized 0..1
    bbox_norm = Column(JSON, nullable=True)  # [x1, y1, x2, y2] normalized to video frame
    speed_kmh = Column(Float, default=0.0)
    distance_covered_m = Column(Float, default=0.0)

    job = relationship("AnalysisJob", back_populates="player_trackings")
    player = relationship("Player", back_populates="trackings")


class FramePrediction(Base):
    __tablename__ = "frame_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("analysis_jobs.id"), nullable=False)
    frame_idx = Column(Integer, nullable=False)
    timestamp_seconds = Column(Float, nullable=False)
    detections = Column(JSON, nullable=False)  # [{bbox, class_id, class_name, confidence, tracker_id, team_id}]
    keypoints = Column(JSON, nullable=True)   # Pitch keypoints
    ball = Column(JSON, nullable=True)        # {x, y, norm_x, norm_y, pitch_x, pitch_y}
    radar_points = Column(JSON, nullable=True) # Normalized player positions on pitch [(x, y, team_id, tracker_id)]
    in_possession_team = Column(Integer, nullable=True)

    job = relationship("AnalysisJob", back_populates="frame_predictions")


class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    match_id = Column(String(36), ForeignKey("matches.id"), nullable=False)
    job_id = Column(String(36), nullable=True)
    timestamp_seconds = Column(Float, nullable=False)
    frame_idx = Column(Integer, nullable=False)
    event_type = Column(String(50), nullable=False)  # 'Possession Change', 'Box Entry', 'High Speed Run', etc.
    player_id = Column(String(36), ForeignKey("players.id"), nullable=True)
    tracker_id = Column(Integer, nullable=True)
    team_id = Column(Integer, nullable=True)
    x_pitch = Column(Float, nullable=True)
    y_pitch = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    is_model_detection = Column(Boolean, default=False)
    is_calculated_statistic = Column(Boolean, default=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match", back_populates="events")


class PlayerStatistic(Base):
    __tablename__ = "player_statistics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    match_id = Column(String(36), ForeignKey("matches.id"), nullable=False)
    distance_covered_m = Column(Float, default=0.0)
    top_speed_kmh = Column(Float, default=0.0)
    avg_speed_kmh = Column(Float, default=0.0)
    minutes_played = Column(Float, default=0.0)
    ball_involvement_rate = Column(Float, default=0.0)
    sprints_count = Column(Integer, default=0)
    stats_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    player = relationship("Player", back_populates="statistics")
    match = relationship("Match", back_populates="player_statistics")
