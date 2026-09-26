import os
from sqlalchemy import create_engine
from app.database.models import Base
from app.core.config import settings

def init_db():
    engine = create_engine(settings.SYNC_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
