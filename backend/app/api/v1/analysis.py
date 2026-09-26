import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.feedback import Feedback
from app.models.cluster import IssueCluster
from app.schemas.cluster import IssueClusterResponse, ProjectAnalysisSummary
from app.schemas.feedback import FeedbackResponse
from app.api.deps import get_current_user
from app.services.clustering import cluster_embeddings
from app.services.summarizer import summarize_cluster
from app.services.embedding import get_embeddings

router = APIRouter()

@router.post("/{project_id}/analysis/trigger", response_model=List[IssueClusterResponse])
async def trigger_analysis(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    all_feedbacks = db.query(Feedback).filter(Feedback.project_id == project_id).all()
    if not all_feedbacks:
        raise HTTPException(
            status_code=400,
            detail="No feedbacks found for this project. Please upload a CSV first."
        )

    negative_feedbacks = [f for f in all_feedbacks if f.sentiment == "negative"]
    if len(negative_feedbacks) < 2:
        target_feedbacks = [f for f in all_feedbacks if f.sentiment in ["negative", "neutral"]]
        if not target_feedbacks:
            target_feedbacks = all_feedbacks
    else:
        target_feedbacks = negative_feedbacks

    missing_emb = [f for f in target_feedbacks if f.embedding is None]
    if missing_emb:
        texts = [f.content for f in missing_emb]
        new_embs = await get_embeddings(texts)
        for f, emb in zip(missing_emb, new_embs):
            f.embedding = emb
        db.commit()

    items_for_clustering = [
        {
            "id": f.id,
            "content": f.content,
            "rating": f.rating,
            "embedding": f.embedding,
            "author_name": f.author_name,
            "sentiment": f.sentiment,
            "source": f.source,
            "created_at": f.created_at,
            "obj": f
        }
        for f in target_feedbacks
    ]

    clusters_dict = cluster_embeddings(items_for_clustering)

    existing_clusters = db.query(IssueCluster).filter(IssueCluster.project_id == project_id).all()
    for ec in existing_clusters:
        db.delete(ec)
    db.commit()

    total_target = len(target_feedbacks)
    saved_clusters = []

    for cluster_id, items in clusters_dict.items():
        if not items:
            continue

        impact_pct = round((len(items) / total_target) * 100, 1)
        summary_data = await summarize_cluster(items)

        cluster_record = IssueCluster(
            project_id=project_id,
            title=summary_data.get("title", f"Issue Group #{cluster_id + 1}"),
            root_cause=summary_data.get("root_cause", "Common user complaint group"),
            severity=summary_data.get("severity", "medium"),
            impact_percentage=impact_pct,
            jira_markdown=summary_data.get("jira_markdown", ""),
            is_resolved=False
        )
        
        for it in items:
            cluster_record.feedbacks.append(it["obj"])

        db.add(cluster_record)
        saved_clusters.append((cluster_record, items))

    db.commit()

    result = []
    for cluster_record, items in saved_clusters:
        db.refresh(cluster_record)
        sample_fbs = [
            FeedbackResponse(
                id=it["id"],
                project_id=project_id,
                content=it["content"],
                rating=it["rating"],
                sentiment=it["sentiment"],
                author_name=it["author_name"],
                source=it["source"],
                created_at=it["created_at"]
            )
            for it in items[:5]
        ]
        result.append(
            IssueClusterResponse(
                id=cluster_record.id,
                project_id=cluster_record.project_id,
                title=cluster_record.title,
                root_cause=cluster_record.root_cause,
                severity=cluster_record.severity,
                impact_percentage=cluster_record.impact_percentage,
                jira_markdown=cluster_record.jira_markdown,
                is_resolved=cluster_record.is_resolved,
                created_at=cluster_record.created_at,
                feedback_count=len(items),
                sample_feedbacks=sample_fbs
            )
        )

    result.sort(key=lambda x: x.impact_percentage, reverse=True)
    return result

@router.get("/{project_id}/analysis/clusters", response_model=ProjectAnalysisSummary)
def get_analysis_clusters(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    total_feedbacks = db.query(func.count(Feedback.id)).filter(Feedback.project_id == project_id).scalar() or 0
    negative_feedbacks = db.query(func.count(Feedback.id)).filter(
        Feedback.project_id == project_id, Feedback.sentiment == "negative"
    ).scalar() or 0
    positive_feedbacks = db.query(func.count(Feedback.id)).filter(
        Feedback.project_id == project_id, Feedback.sentiment == "positive"
    ).scalar() or 0
    neutral_feedbacks = db.query(func.count(Feedback.id)).filter(
        Feedback.project_id == project_id, Feedback.sentiment == "neutral"
    ).scalar() or 0

    clusters = db.query(IssueCluster).filter(IssueCluster.project_id == project_id).order_by(IssueCluster.impact_percentage.desc()).all()

    cluster_responses = []
    for c in clusters:
        sample_feedbacks = [
            FeedbackResponse(
                id=fb.id,
                project_id=fb.project_id,
                content=fb.content,
                rating=fb.rating,
                sentiment=fb.sentiment,
                author_name=fb.author_name,
                source=fb.source,
                created_at=fb.created_at
            )
            for fb in c.feedbacks[:5]
        ]
        cluster_responses.append(
            IssueClusterResponse(
                id=c.id,
                project_id=c.project_id,
                title=c.title,
                root_cause=c.root_cause,
                severity=c.severity,
                impact_percentage=c.impact_percentage,
                jira_markdown=c.jira_markdown,
                is_resolved=c.is_resolved,
                created_at=c.created_at,
                feedback_count=len(c.feedbacks),
                sample_feedbacks=sample_feedbacks
            )
        )

    return ProjectAnalysisSummary(
        project_id=project_id,
        total_feedbacks=total_feedbacks,
        negative_feedbacks=negative_feedbacks,
        positive_feedbacks=positive_feedbacks,
        neutral_feedbacks=neutral_feedbacks,
        clusters=cluster_responses
    )

@router.patch("/{project_id}/clusters/{cluster_id}/toggle-resolve", response_model=IssueClusterResponse)
def toggle_cluster_resolved(
    project_id: uuid.UUID,
    cluster_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    cluster = db.query(IssueCluster).filter(IssueCluster.id == cluster_id, IssueCluster.project_id == project_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")

    cluster.is_resolved = not cluster.is_resolved
    db.commit()
    db.refresh(cluster)

    sample_feedbacks = [
        FeedbackResponse(
            id=fb.id,
            project_id=fb.project_id,
            content=fb.content,
            rating=fb.rating,
            sentiment=fb.sentiment,
            author_name=fb.author_name,
            source=fb.source,
            created_at=fb.created_at
        )
        for fb in cluster.feedbacks[:5]
    ]

    return IssueClusterResponse(
        id=cluster.id,
        project_id=cluster.project_id,
        title=cluster.title,
        root_cause=cluster.root_cause,
        severity=cluster.severity,
        impact_percentage=cluster.impact_percentage,
        jira_markdown=cluster.jira_markdown,
        is_resolved=cluster.is_resolved,
        created_at=cluster.created_at,
        feedback_count=len(cluster.feedbacks),
        sample_feedbacks=sample_feedbacks
    )

