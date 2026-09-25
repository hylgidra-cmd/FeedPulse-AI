from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime
from app.schemas.feedback import FeedbackResponse

class IssueClusterBase(BaseModel):
    title: str
    root_cause: str
    severity: str = "medium"
    impact_percentage: float = 0.0
    jira_markdown: Optional[str] = None
    is_resolved: bool = False

class IssueClusterResponse(IssueClusterBase):
    id: uuid.UUID
    project_id: uuid.UUID
    created_at: datetime
    feedback_count: int = 0
    sample_feedbacks: List[FeedbackResponse] = []

    class Config:
        from_attributes = True

class ProjectAnalysisSummary(BaseModel):
    project_id: uuid.UUID
    total_feedbacks: int
    negative_feedbacks: int
    positive_feedbacks: int
    neutral_feedbacks: int
    clusters: List[IssueClusterResponse]
