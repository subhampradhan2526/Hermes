from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.session import get_db
from app.database import models
from app.schemas.analysis import AnalysisJobCreate, AnalysisStatusResponse
import uuid

router = APIRouter()

import os
from datetime import datetime
from app.ml.model_router import model_router
from app.core.config import settings

def process_video_background(analysis_id: str, db: Session):
    job = db.query(models.AnalysisJob).filter(models.AnalysisJob.id == analysis_id).first()
    if not job:
        return
    
    match = db.query(models.Match).filter(models.Match.id == job.match_id).first()
    video = db.query(models.Video).filter(models.Video.id == job.video_id).first()
    
    if not video or not os.path.exists(video.filepath):
        job.status = "failed"
        job.error_message = f"Video file not found at path: {video.filepath if video else 'None'}"
        if match:
            match.status = "failed"
        db.commit()
        return

    try:
        job.status = "processing"
        job.stage = "running_inference"
        job.started_at = datetime.utcnow()
        if match:
            match.status = "analyzing"
        db.commit()

        target_video_name = f"{analysis_id}_processed.mp4"
        target_video_path = os.path.join(settings.PROCESSED_PATH, target_video_name)

        def progress_callback(stage: str, progress: int, details: dict):
            job.stage = stage
            job.progress = progress
            db.commit()

        adapter = model_router.get_adapter(job.model_name)
        
        # Run video analysis through computer vision pipeline
        result_data = adapter.analyze_video(
            source_video_path=video.filepath,
            target_video_path=target_video_path,
            progress_callback=progress_callback,
            mode=job.mode or "RADAR"
        )

        job.status = "completed"
        job.stage = "completed"
        job.progress = 100
        job.completed_at = datetime.utcnow()
        job.result_video_path = f"/storage/processed/{target_video_name}"
        job.total_frames_analyzed = result_data.get("total_frames_analyzed", 0)
        job.results_summary = result_data.get("summary", {})

        if match:
            match.status = "completed"

        # Save Player Statistics & Players to DB
        player_stats = result_data.get("player_statistics", [])
        for ps in player_stats:
            tracker_id = ps["tracker_id"]
            team_id = ps["team_id"]
            
            # Check or create Player
            player = db.query(models.Player).filter(
                models.Player.match_id == match.id,
                models.Player.tracker_id == tracker_id
            ).first()

            if not player:
                player = models.Player(
                    match_id=match.id,
                    tracker_id=tracker_id,
                    team_id=team_id,
                    name=f"Player #{tracker_id}",
                    jersey_number=str(tracker_id),
                    position="Midfielder" if tracker_id % 3 == 0 else ("Forward" if tracker_id % 2 == 0 else "Defender")
                )
                db.add(player)
                db.flush()

            player_stat = models.PlayerStatistic(
                player_id=player.id,
                match_id=match.id,
                distance_covered_m=ps.get("distance_covered_m", 0.0),
                top_speed_kmh=ps.get("top_speed_kmh", 0.0),
                avg_speed_kmh=ps.get("avg_speed_kmh", 0.0),
                sprints_count=ps.get("sprints_count", 0),
                stats_json=ps
            )
            db.add(player_stat)

        # Save Events
        events = result_data.get("events", [])
        for ev in events:
            db_event = models.Event(
                match_id=match.id,
                job_id=job.id,
                timestamp_seconds=ev.get("timestamp_seconds", 0.0),
                frame_idx=ev.get("frame_idx", 0),
                event_type=ev.get("event_type", "Event"),
                tracker_id=ev.get("tracker_id"),
                team_id=ev.get("team_id"),
                confidence=ev.get("confidence", 0.9),
                is_model_detection=ev.get("is_model_detection", False),
                is_calculated_statistic=ev.get("is_calculated_statistic", True),
                details=ev.get("details", {})
            )
            db.add(db_event)

        # Save Frame Predictions
        frame_preds = result_data.get("frame_predictions", [])
        for fp in frame_preds:
            if fp["frame_idx"] % 5 == 0:
                frame_pred = models.FramePrediction(
                    job_id=job.id,
                    frame_idx=fp["frame_idx"],
                    timestamp_seconds=fp["timestamp_seconds"],
                    detections=fp.get("detections", []),
                    ball=fp.get("ball"),
                    radar_points=fp.get("radar_points", []),
                    in_possession_team=fp.get("in_possession_team")
                )
                db.add(frame_pred)

        db.commit()

    except Exception as e:
        import traceback
        traceback.print_exc()
        job.status = "failed"
        job.error_message = str(e)
        if match:
            match.status = "failed"
        db.commit()

@router.post("/", response_model=AnalysisStatusResponse, status_code=status.HTTP_201_CREATED)
def create_analysis_job(
    job_req: AnalysisJobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Verify match and video exist
    match = db.query(models.Match).filter(models.Match.id == job_req.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    video = db.query(models.Video).filter(models.Video.id == job_req.video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    job = models.AnalysisJob(
        match_id=job_req.match_id,
        video_id=job_req.video_id,
        model_name=job_req.model_name,
        mode=job_req.mode,
        status="pending",
        stage="queued",
        progress=0
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Queue background task
    background_tasks.add_task(process_video_background, job.id, db)

    return AnalysisStatusResponse(
        analysis_id=job.id,
        match_id=job.match_id,
        video_id=job.video_id,
        model_name=job.model_name,
        mode=job.mode,
        status=job.status,
        stage=job.stage,
        progress=job.progress
    )

@router.get("/{analysis_id}", response_model=AnalysisStatusResponse)
def get_analysis_status(analysis_id: str, db: Session = Depends(get_db)):
    job = db.query(models.AnalysisJob).filter(models.AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    
    return AnalysisStatusResponse(
        analysis_id=job.id,
        match_id=job.match_id,
        video_id=job.video_id,
        model_name=job.model_name,
        mode=job.mode,
        status=job.status,
        stage=job.stage,
        progress=job.progress,
        error_message=job.error_message,
        started_at=job.started_at,
        completed_at=job.completed_at
    )
