from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    platform: Optional[str] = "general"

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    platform: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    feedbacks_count: Optional[int] = 0
    clusters_count: Optional[int] = 0

    class Config:
        from_attributes = True
