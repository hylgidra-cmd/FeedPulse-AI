from fastapi import APIRouter
from app.api.v1 import auth, projects, feedbacks, analysis

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(feedbacks.router, prefix="/projects", tags=["Feedbacks"])
api_router.include_router(analysis.router, prefix="/projects", tags=["Analysis"])
