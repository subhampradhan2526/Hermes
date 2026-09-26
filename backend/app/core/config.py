import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator
import torch

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "Football AI Analytics Platform"
    VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Storage Paths
    STORAGE_PATH: str = str(BASE_DIR / "backend" / "storage")
    UPLOADS_PATH: str = str(BASE_DIR / "backend" / "storage" / "uploads")
    PROCESSED_PATH: str = str(BASE_DIR / "backend" / "storage" / "processed")
    REPORTS_PATH: str = str(BASE_DIR / "backend" / "storage" / "reports")

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR}/backend/storage/football_ai.db"
    SYNC_DATABASE_URL: str = f"sqlite:///{BASE_DIR}/backend/storage/football_ai.db"

    # Computer Vision Models
    PLAYER_MODEL_PATH: str = str(BASE_DIR / "examples" / "soccer" / "data" / "football-player-detection.pt")
    BALL_MODEL_PATH: str = str(BASE_DIR / "examples" / "soccer" / "data" / "football-ball-detection.pt")
    PITCH_MODEL_PATH: str = str(BASE_DIR / "examples" / "soccer" / "data" / "football-pitch-detection.pt")
    SAMPLE_VIDEO_PATH: str = str(BASE_DIR / "examples" / "soccer" / "data" / "2e57b9_0.mp4")

    # Hardware Acceleration: default to mps on Apple Silicon, cuda if nvidia, else cpu
    DEVICE: str = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")

    # Custom Model Router Configuration
    MODEL_BASE_URL: str = ""
    MODEL_ENDPOINT: str = ""
    MODEL_API_KEY: str = ""
    MODEL_TIMEOUT: int = 120
    DEFAULT_MODEL: str = "existing_pipeline"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Ensure directories exist
os.makedirs(settings.STORAGE_PATH, exist_ok=True)
os.makedirs(settings.UPLOADS_PATH, exist_ok=True)
os.makedirs(settings.PROCESSED_PATH, exist_ok=True)
os.makedirs(settings.REPORTS_PATH, exist_ok=True)
