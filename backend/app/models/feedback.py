import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID

try:
    from pgvector.sqlalchemy import Vector
    VectorType = Vector(1536)
except (ImportError, Exception):
    from sqlalchemy import JSON
    VectorType = JSON

feedback_cluster_map = Table(
    "feedback_cluster_map",
    Base.metadata,
    Column("feedback_id", GUID(), ForeignKey("feedbacks.id", ondelete="CASCADE"), primary_key=True),
    Column("cluster_id", GUID(), ForeignKey("issue_clusters.id", ondelete="CASCADE"), primary_key=True)
)

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    project_id = Column(GUID(), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    source = Column(String(50), nullable=False)
    author_name = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)
    sentiment = Column(String(20), nullable=True)
    embedding = Column(VectorType, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="feedbacks")
    clusters = relationship("IssueCluster", secondary=feedback_cluster_map, back_populates="feedbacks")
