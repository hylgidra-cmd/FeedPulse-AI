import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.feedback import Feedback
from app.models.cluster import IssueCluster
from app.schemas.project import ProjectCreate, ProjectResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    
    result = []
    for p in projects:
        f_count = db.query(func.count(Feedback.id)).filter(Feedback.project_id == p.id).scalar() or 0
        c_count = db.query(func.count(IssueCluster.id)).filter(IssueCluster.project_id == p.id).scalar() or 0
        result.append(
            ProjectResponse(
                id=p.id,
                user_id=p.user_id,
                name=p.name,
                description=p.description,
                platform=p.platform,
                created_at=p.created_at,
                feedbacks_count=f_count,
                clusters_count=c_count
            )
        )
    return result

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = Project(
        user_id=current_user.id,
        name=project_in.name,
        description=project_in.description,
        platform=project_in.platform or "general"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse(
        id=project.id,
        user_id=project.user_id,
        name=project.name,
        description=project.description,
        platform=project.platform,
        created_at=project.created_at,
        feedbacks_count=0,
        clusters_count=0
    )

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    f_count = db.query(func.count(Feedback.id)).filter(Feedback.project_id == project.id).scalar() or 0
    c_count = db.query(func.count(IssueCluster.id)).filter(IssueCluster.project_id == project.id).scalar() or 0

    return ProjectResponse(
        id=project.id,
        user_id=project.user_id,
        name=project.name,
        description=project.description,
        platform=project.platform,
        created_at=project.created_at,
        feedbacks_count=f_count,
        clusters_count=c_count
    )

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return None
