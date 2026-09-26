from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router
import app.models

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="FeedPulse AI - Voice of Customer to Product Roadmap"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_init():
    if "postgres" in settings.DATABASE_URL.lower():
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()
                print("[Database] Successfully ensured pgvector extension is available.")
        except Exception as e:
            print(f"[Database Warning] Could not create pgvector extension: {e}")

    try:
        Base.metadata.create_all(bind=engine)
        print("[Database] Schema initialized successfully.")
    except Exception as e:
        print(f"[Database Error] Error initializing tables: {e}")

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(api_router, prefix=settings.API_V1_STR)
