import os
import shutil
import cv2
from typing import Dict, Any, Optional
from fastapi import UploadFile
from app.core.config import settings


class VideoService:
    @staticmethod
    def get_video_metadata(video_path: str) -> Dict[str, Any]:
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = float(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = total_frames / fps if fps > 0 else 0.0
        cap.release()

        file_size = os.path.getsize(video_path)

        return {
            "total_frames": total_frames,
            "fps": fps,
            "width": width,
            "height": height,
            "duration": duration,
            "file_size": file_size
        }

    @staticmethod
    async def save_uploaded_file(upload_file: UploadFile) -> str:
        filename = upload_file.filename or "uploaded_video.mp4"
        # Sanitize filename
        safe_filename = "".join(c for c in filename if c.isalnum() or c in "._- ")
        dest_path = os.path.join(settings.UPLOADS_PATH, safe_filename)

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        return dest_path


video_service = VideoService()
