from fastapi import APIRouter
from app.api.endpoints import videos, analysis, matches

api_router = APIRouter()

api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])
