from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Football AI Analytics Platform API"
)

# Set all CORS enabled origins
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

os.makedirs(settings.UPLOADS_PATH, exist_ok=True)
os.makedirs(settings.PROCESSED_PATH, exist_ok=True)

app.mount("/storage/uploads", StaticFiles(directory=settings.UPLOADS_PATH), name="uploads")
app.mount("/storage/processed", StaticFiles(directory=settings.PROCESSED_PATH), name="processed")

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok"}

