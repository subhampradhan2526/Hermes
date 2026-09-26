from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.database import models
from app.schemas.match import MatchCreate, MatchUpdate, MatchResponse, MatchDetailResponse

router = APIRouter()

@router.post("/", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
def create_match(match_in: MatchCreate, db: Session = Depends(get_db)):
    db_match = models.Match(
        title=match_in.title,
        team_a_name=match_in.team_a_name,
        team_b_name=match_in.team_b_name,
        team_a_color=match_in.team_a_color,
        team_b_color=match_in.team_b_color,
        score_a=match_in.score_a or 0,
        score_b=match_in.score_b or 0,
        date=match_in.date,
        venue=match_in.venue,
        is_demo=match_in.is_demo,
        status="created",
        video_id=match_in.video_id
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    
    return MatchResponse(
        id=db_match.id,
        title=db_match.title,
        team_a_name=db_match.team_a_name,
        team_b_name=db_match.team_b_name,
        team_a_color=db_match.team_a_color,
        team_b_color=db_match.team_b_color,
        score_a=db_match.score_a,
        score_b=db_match.score_b,
        date=db_match.date,
        venue=db_match.venue,
        is_demo=db_match.is_demo,
        status=db_match.status,
        video_id=db_match.video_id,
        created_at=db_match.created_at,
        players_count=0,
        events_count=0
    )

@router.get("/", response_model=List[MatchResponse])
def get_matches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    matches = db.query(models.Match).order_by(models.Match.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for m in matches:
        p_count = db.query(models.Player).filter(models.Player.match_id == m.id).count()
        e_count = db.query(models.Event).filter(models.Event.match_id == m.id).count()
        latest_job = db.query(models.AnalysisJob).filter(models.AnalysisJob.match_id == m.id).order_by(models.AnalysisJob.created_at.desc()).first()

        results.append(MatchResponse(
            id=m.id,
            title=m.title,
            team_a_name=m.team_a_name,
            team_b_name=m.team_b_name,
            team_a_color=m.team_a_color,
            team_b_color=m.team_b_color,
            score_a=m.score_a,
            score_b=m.score_b,
            date=m.date,
            venue=m.venue,
            is_demo=m.is_demo,
            status=m.status,
            video_id=m.video_id,
            created_at=m.created_at,
            players_count=p_count,
            events_count=e_count,
            latest_job_id=latest_job.id if latest_job else None,
            latest_job_status=latest_job.status if latest_job else None,
            latest_job_progress=latest_job.progress if latest_job else 0
        ))
    return results

@router.get("/{match_id}", response_model=MatchDetailResponse)
def get_match(match_id: str, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    p_count = db.query(models.Player).filter(models.Player.match_id == match.id).count()
    e_count = db.query(models.Event).filter(models.Event.match_id == match.id).count()
    latest_job = db.query(models.AnalysisJob).filter(models.AnalysisJob.match_id == match.id).order_by(models.AnalysisJob.created_at.desc()).first()

    response = MatchDetailResponse(
        id=match.id,
        title=match.title,
        team_a_name=match.team_a_name,
        team_b_name=match.team_b_name,
        team_a_color=match.team_a_color,
        team_b_color=match.team_b_color,
        score_a=match.score_a,
        score_b=match.score_b,
        date=match.date,
        venue=match.venue,
        is_demo=match.is_demo,
        status=match.status,
        video_id=match.video_id,
        created_at=match.created_at,
        players_count=p_count,
        events_count=e_count,
        latest_job_id=latest_job.id if latest_job else None,
        latest_job_status=latest_job.status if latest_job else None,
        latest_job_progress=latest_job.progress if latest_job else 0,
        statistics_summary=latest_job.results_summary if latest_job else None
    )
    
    if latest_job and latest_job.result_video_path:
        response.video_url = latest_job.result_video_path
    elif match.video:
        response.video_url = f"/api/v1/videos/{match.video.id}/stream"
        
    if match.video:
        response.video_duration = match.video.duration
        response.video_fps = match.video.fps
        response.video_width = match.video.width
        response.video_height = match.video.height
        
    return response

@router.get("/{match_id}/players")
def get_match_players(match_id: str, db: Session = Depends(get_db)):
    players = db.query(models.Player).filter(models.Player.match_id == match_id).all()
    results = []
    for p in players:
        stat = db.query(models.PlayerStatistic).filter(models.PlayerStatistic.player_id == p.id).first()
        results.append({
            "id": p.id,
            "tracker_id": p.tracker_id,
            "team_id": p.team_id,
            "name": p.name,
            "jersey_number": p.jersey_number,
            "position": p.position,
            "is_goalkeeper": p.is_goalkeeper,
            "statistics": {
                "distance_covered_m": stat.distance_covered_m if stat else 0.0,
                "top_speed_kmh": stat.top_speed_kmh if stat else 0.0,
                "avg_speed_kmh": stat.avg_speed_kmh if stat else 0.0,
                "sprints_count": stat.sprints_count if stat else 0,
                "stats_json": stat.stats_json if stat else {}
            } if stat else None
        })
    return results

@router.get("/{match_id}/events")
def get_match_events(match_id: str, db: Session = Depends(get_db)):
    events = db.query(models.Event).filter(models.Event.match_id == match_id).order_by(models.Event.timestamp_seconds.asc()).all()
    return [{
        "id": e.id,
        "timestamp_seconds": e.timestamp_seconds,
        "frame_idx": e.frame_idx,
        "event_type": e.event_type,
        "tracker_id": e.tracker_id,
        "team_id": e.team_id,
        "confidence": e.confidence,
        "details": e.details
    } for e in events]

@router.get("/{match_id}/radar")
def get_match_radar(match_id: str, db: Session = Depends(get_db)):
    latest_job = db.query(models.AnalysisJob).filter(models.AnalysisJob.match_id == match_id).order_by(models.AnalysisJob.created_at.desc()).first()
    if not latest_job:
        return []
    frames = db.query(models.FramePrediction).filter(models.FramePrediction.job_id == latest_job.id).order_by(models.FramePrediction.frame_idx.asc()).all()
    return [{
        "frame_idx": f.frame_idx,
        "timestamp_seconds": f.timestamp_seconds,
        "radar_points": f.radar_points,
        "ball": f.ball,
        "in_possession_team": f.in_possession_team
    } for f in frames]

@router.get("/{match_id}/analytics")
def get_match_analytics(match_id: str, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    latest_job = db.query(models.AnalysisJob).filter(models.AnalysisJob.match_id == match.id).order_by(models.AnalysisJob.created_at.desc()).first()
    stats = db.query(models.PlayerStatistic).filter(models.PlayerStatistic.match_id == match.id).all()
    
    team_a_distance = sum(s.distance_covered_m for s in stats if s.player and s.player.team_id == 0)
    team_b_distance = sum(s.distance_covered_m for s in stats if s.player and s.player.team_id == 1)
    
    top_sprinters = sorted(stats, key=lambda s: s.top_speed_kmh, reverse=True)[:5]
    
    return {
        "match_id": match.id,
        "title": match.title,
        "status": match.status,
        "possession": latest_job.results_summary.get("possession") if latest_job and latest_job.results_summary else {"team_a_pct": 50.0, "team_b_pct": 50.0},
        "team_a": {
            "name": match.team_a_name,
            "color": match.team_a_color,
            "total_distance_m": round(team_a_distance, 1)
        },
        "team_b": {
            "name": match.team_b_name,
            "color": match.team_b_color,
            "total_distance_m": round(team_b_distance, 1)
        },
        "top_sprinters": [{
            "player_id": s.player_id,
            "name": s.player.name if s.player else f"Player #{s.player_id}",
            "team_id": s.player.team_id if s.player else 0,
            "top_speed_kmh": s.top_speed_kmh,
            "sprints_count": s.sprints_count
        } for s in top_sprinters]
    }

