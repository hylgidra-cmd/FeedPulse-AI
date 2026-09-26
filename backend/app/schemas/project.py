from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    platform: Optional[str] = "general"
    website_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    platform: Optional[str] = None
    website_url: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    api_key: Optional[str] = None
    feedbacks_count: Optional[int] = 0
    clusters_count: Optional[int] = 0

    class Config:
        from_attributes = True

class WebsiteInspectRequest(BaseModel):
    url: str

class WebsiteInspectResponse(BaseModel):
    success: bool
    url: str
    site_title: str
    site_description: str
    is_educational: bool
    detected_courses: list[str] = []
    reviews_found: list[dict] = []
    has_reviews: bool
    diagnostic_message: str
    error: Optional[str] = None
