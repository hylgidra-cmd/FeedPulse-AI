import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID
from app.models.feedback import feedback_cluster_map

class IssueCluster(Base):
    __tablename__ = "issue_clusters"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    root_cause = Column(Text, nullable=False)
    severity = Column(String(20), default="medium")
    impact_percentage = Column(Float, default=0.0)
    jira_markdown = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="clusters")
    feedbacks = relationship("Feedback", secondary=feedback_cluster_map, back_populates="clusters")
