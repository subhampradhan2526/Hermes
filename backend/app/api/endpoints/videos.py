from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request, BackgroundTasks
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.database import models
from app.services.video_service import video_service
from pydantic import BaseModel
import os

router = APIRouter()


class VideoResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    status: str
    duration: float
    fps: float
    width: int
    height: int
    file_size: int
    url: str

    class Config:
        from_attributes = True


@router.post("/", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Fix: handle browser not sending content-type cleanly
    content_type = file.content_type or ""
    if not (content_type.startswith("video/") or file.filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv", ".webm"))):
        raise HTTPException(status_code=400, detail="File provided is not a video.")

    # Fix: sanitize filename early to avoid None crash
    if not file.filename:
        file.filename = "uploaded_video.mp4"

    # Save the file
    try:
        saved_path = await video_service.save_uploaded_file(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Get metadata
    try:
        metadata = video_service.get_video_metadata(saved_path)
    except Exception as e:
        if os.path.exists(saved_path):
            os.remove(saved_path)
        raise HTTPException(status_code=400, detail=f"Failed to process video metadata: {str(e)}")

    db_video = models.Video(
        filename=os.path.basename(saved_path),
        original_filename=file.filename or os.path.basename(saved_path),
        filepath=saved_path,
        status="uploaded",
        duration=metadata["duration"],
        fps=metadata["fps"],
        width=metadata["width"],
        height=metadata["height"],
        file_size=metadata["file_size"],
        total_frames=metadata["total_frames"]
    )

    db.add(db_video)
    db.commit()
    db.refresh(db_video)

    return VideoResponse(
        id=db_video.id,
        filename=db_video.filename,
        original_filename=db_video.original_filename,
        status=db_video.status,
        duration=db_video.duration,
        fps=db_video.fps,
        width=db_video.width,
        height=db_video.height,
        file_size=db_video.file_size,
        url=f"/api/v1/videos/{db_video.id}/stream"
    )


@router.get("/", response_model=List[VideoResponse])
def get_videos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    videos = db.query(models.Video).offset(skip).limit(limit).all()
    results = []
    for v in videos:
        results.append(VideoResponse(
            id=v.id,
            filename=v.filename,
            original_filename=v.original_filename or v.filename,
            status=v.status,
            duration=v.duration,
            fps=v.fps,
            width=v.width,
            height=v.height,
            file_size=v.file_size,
            url=f"/api/v1/videos/{v.id}/stream"
        ))
    return results


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: str, db: Session = Depends(get_db)):
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return VideoResponse(
        id=video.id,
        filename=video.filename,
        original_filename=video.original_filename or video.filename,
        status=video.status,
        duration=video.duration,
        fps=video.fps,
        width=video.width,
        height=video.height,
        file_size=video.file_size,
        url=f"/api/v1/videos/{video.id}/stream"
    )


@router.get("/{video_id}/stream")
def stream_video(video_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Stream video with HTTP Range support (required for Safari / HTML5 video seeking).
    """
    video = db.query(models.Video).filter(models.Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video_path = video.filepath

    # If the job has a processed result, use that instead
    latest_job = db.query(models.AnalysisJob).filter(
        models.AnalysisJob.video_id == video_id,
        models.AnalysisJob.status == "completed"
    ).order_by(models.AnalysisJob.created_at.desc()).first()

    if latest_job and latest_job.result_video_path:
        # Strip leading "/" and resolve
        from app.core.config import settings
        result_filename = os.path.basename(latest_job.result_video_path)
        candidate = os.path.join(settings.PROCESSED_PATH, result_filename)
        if os.path.exists(candidate):
            video_path = candidate

    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail=f"Video file not found on disk")

    file_size = os.path.getsize(video_path)
    range_header = request.headers.get("Range")

    def iter_file(start: int, end: int, chunk: int = 1024 * 1024):
        with open(video_path, "rb") as f:
            f.seek(start)
            remaining = end - start + 1
            while remaining > 0:
                data = f.read(min(chunk, remaining))
                if not data:
                    break
                remaining -= len(data)
                yield data

    if range_header:
        # Parse "bytes=start-end"
        try:
            range_val = range_header.strip().replace("bytes=", "")
            parts = range_val.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if parts[1] else file_size - 1
        except Exception:
            start = 0
            end = file_size - 1

        end = min(end, file_size - 1)
        content_length = end - start + 1

        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(content_length),
            "Content-Type": "video/mp4",
        }
        return StreamingResponse(
            iter_file(start, end),
            status_code=206,
            headers=headers,
            media_type="video/mp4"
        )
    else:
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": "video/mp4",
        }
        return StreamingResponse(
            iter_file(0, file_size - 1),
            status_code=200,
            headers=headers,
            media_type="video/mp4"
        )
