import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.feedback import Feedback
from app.models.cluster import IssueCluster
from app.schemas.feedback import FeedbackResponse, FeedbackUploadStats, AppStoreScrapeRequest
from app.api.deps import get_current_user
from app.services.parsers.csv_parser import parse_feedback_csv
from app.services.parsers.store_scraper import fetch_app_store_reviews
from app.services.embedding import get_embeddings

router = APIRouter()

@router.post("/{project_id}/feedbacks/upload-csv", response_model=FeedbackUploadStats)
async def upload_csv_feedbacks(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content_bytes = await file.read()
    try:
        valid_items, total_parsed, ignored_short = parse_feedback_csv(content_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if not valid_items:
        return FeedbackUploadStats(
            total_parsed=total_parsed,
            total_inserted=0,
            ignored_short=ignored_short,
            message="No valid feedbacks found in CSV file."
        )

    texts_to_embed = [item["content"] for item in valid_items]
    embeddings = await get_embeddings(texts_to_embed)

    db_items = []
    for idx, item in enumerate(valid_items):
        db_feedback = Feedback(
            project_id=project_id,
            source=item["source"],
            author_name=item["author_name"],
            content=item["content"],
            rating=item["rating"],
            sentiment=item["sentiment"],
            embedding=embeddings[idx] if idx < len(embeddings) else None
        )
        db_items.append(db_feedback)

    db.add_all(db_items)
    db.commit()

    return FeedbackUploadStats(
        total_parsed=total_parsed,
        total_inserted=len(db_items),
        ignored_short=ignored_short,
        message=f"Successfully imported {len(db_items)} feedbacks from {file.filename}."
    )

@router.post("/{project_id}/feedbacks/scrape-app-store", response_model=FeedbackUploadStats)
async def scrape_app_store_feedbacks(
    project_id: uuid.UUID,
    payload: AppStoreScrapeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        valid_items, total_parsed, ignored_short = await fetch_app_store_reviews(payload.app_id, payload.country)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape App Store: {str(e)}")

    if not valid_items:
        return FeedbackUploadStats(
            total_parsed=total_parsed,
            total_inserted=0,
            ignored_short=ignored_short,
            message="No valid feedbacks retrieved from App Store."
        )

    # If replace_existing is True, clear existing feedbacks and clusters so apps never mix!
    if payload.replace_existing:
        db.query(Feedback).filter(Feedback.project_id == project_id).delete()
        db.query(IssueCluster).filter(IssueCluster.project_id == project_id).delete()
        db.commit()

    texts_to_embed = [item["content"] for item in valid_items]
    embeddings = await get_embeddings(texts_to_embed)

    source_tag = f"app_store:{payload.app_name}" if payload.app_name else "app_store"

    db_items = []
    for idx, item in enumerate(valid_items):
        db_feedback = Feedback(
            project_id=project_id,
            source=source_tag,
            author_name=item["author_name"],
            content=item["content"],
            rating=item["rating"],
            sentiment=item["sentiment"],
            embedding=embeddings[idx] if idx < len(embeddings) else None
        )
        db_items.append(db_feedback)

    db.add_all(db_items)
    db.commit()

    app_label = payload.app_name or payload.app_id
    action_label = "almashtirildi (toza tahlil)" if payload.replace_existing else "qo'shildi"

    return FeedbackUploadStats(
        total_parsed=total_parsed,
        total_inserted=len(db_items),
        ignored_short=ignored_short,
        message=f"{app_label} bo'yicha {len(db_items)} ta yangi real sharh muvaffaqiyatli {action_label}."
    )

@router.delete("/{project_id}/feedbacks/clear", response_model=dict)
def clear_project_feedbacks(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    deleted_count = db.query(Feedback).filter(Feedback.project_id == project_id).delete()
    db.query(IssueCluster).filter(IssueCluster.project_id == project_id).delete()
    db.commit()

    return {"message": f"Muvaffaqiyatli tozalandi: {deleted_count} ta sharh va tahlillar o'chirildi.", "deleted_count": deleted_count}

@router.get("/{project_id}/feedbacks", response_model=List[FeedbackResponse])
def get_feedbacks(
    project_id: uuid.UUID,
    sentiment: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Feedback).filter(Feedback.project_id == project_id)
    if sentiment:
        query = query.filter(Feedback.sentiment == sentiment)

    return query.order_by(Feedback.created_at.desc()).offset(offset).limit(limit).all()
