from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime

class FeedbackBase(BaseModel):
    content: str
    source: str = "csv"
    author_name: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    sentiment: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(FeedbackBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackUploadStats(BaseModel):
    total_parsed: int
    total_inserted: int
    ignored_short: int
    message: str
