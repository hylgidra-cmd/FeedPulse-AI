import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.feedback import Feedback
from app.models.cluster import IssueCluster
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    WebsiteInspectRequest,
    WebsiteInspectResponse,
)
from app.api.deps import get_current_user
from app.services.parsers.web_inspector import inspect_website_content
from app.services.embedding import get_embeddings
from app.services.clustering import cluster_embeddings
from app.services.summarizer import summarize_cluster

router = APIRouter()

@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    if not projects:
        try:
            await seed_datalife_demo(db, current_user)
            projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
        except Exception as e:
            print(f"[Auto-seed on get_projects error]: {e}")
    
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
                website_url=getattr(p, 'website_url', None),
                api_key=getattr(p, 'api_key', None),
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
    gen_api_key = f"fp_live_{uuid.uuid4().hex[:20]}"
    project = Project(
        user_id=current_user.id,
        name=project_in.name,
        description=project_in.description,
        platform=project_in.platform or "general",
        website_url=project_in.website_url,
        api_key=gen_api_key
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
        website_url=project.website_url,
        api_key=project.api_key,
        created_at=project.created_at,
        feedbacks_count=0,
        clusters_count=0
    )

@router.post("/inspect-website", response_model=WebsiteInspectResponse)
async def inspect_website(
    payload: WebsiteInspectRequest,
    current_user: User = Depends(get_current_user)
):
    if not payload.url:
        raise HTTPException(status_code=400, detail="Veb-sayt URL manzili kiritilmadi.")
    result = await inspect_website_content(payload.url)
    return result

@router.post("/seed-demo", response_model=ProjectResponse)
async def seed_datalife_demo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if DATA LIFE demo project already exists for this user
    existing = db.query(Project).filter(
        Project.user_id == current_user.id,
        Project.name == "DATA LIFE — IT Education Center"
    ).first()

    if existing:
        f_count = db.query(func.count(Feedback.id)).filter(Feedback.project_id == existing.id).scalar() or 0
        c_count = db.query(func.count(IssueCluster.id)).filter(IssueCluster.project_id == existing.id).scalar() or 0
        return ProjectResponse(
            id=existing.id,
            user_id=existing.user_id,
            name=existing.name,
            description=existing.description,
            platform=existing.platform,
            website_url=existing.website_url,
            api_key=existing.api_key,
            created_at=existing.created_at,
            feedbacks_count=f_count,
            clusters_count=c_count
        )

    # Create new Data Life project
    gen_api_key = f"fp_live_{uuid.uuid4().hex[:20]}"
    project = Project(
        user_id=current_user.id,
        name="DATA LIFE — IT Education Center",
        description="Nókis IT akademiyasi — kurslar, mentorlar va o'quvchilar fikr-mulohazalari tahlili.",
        platform="general",
        website_url="https://datalife.uz",
        api_key=gen_api_key
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Realistic student Voice of Customer feedback for Data Life courses
    sample_feedbacks = [
        {"content": "Frontend kursida 4-oy amaliyoti juda qiyinlashib ketdi, ko'proq mentor yordami va real portfolio loyiha kerak.", "rating": 2, "sentiment": "negative", "author": "Azizbek (Frontend talabasi)", "source": "datalife:frontend"},
        {"content": "O'quv markazidagi Wi-Fi internet tezligi past, dars paytida npm install va GitHub repolarni klon qilishda ancha vaqt yo'qotyapmiz.", "rating": 2, "sentiment": "negative", "author": "Bekzod (Backend talabasi)", "source": "datalife:infrastructure"},
        {"content": "Kechki guruhlar (19:00 dan keyin) talab qilinmoqda, chunki ko'pchilik talaba yoki ishlaydi, kunduzgi vaqt to'g'ri kelmayapti.", "rating": 3, "sentiment": "negative", "author": "Malika (Python kursi)", "source": "datalife:schedule"},
        {"content": "Python darsida uyga berilgan vazifalarni tekshirish va Code Review 2-3 kunga kechikmoqda, mentor tezroq javob qaytarsa yaxshi bo'lardi.", "rating": 2, "sentiment": "negative", "author": "Timur (Python talabasi)", "source": "datalife:python"},
        {"content": "Web Security (OWASP Top 10) laboratoriya serveri amaliyot paytida tez-tez qotib qolyapti, pentest testlarini oxirigacha yetkaza olmadik.", "rating": 2, "sentiment": "negative", "author": "Jasur (Kiberxavfsizlik)", "source": "datalife:security"},
        {"content": "Frontend o'qituvchisi Yangiboyev Jamshid tushuntirish metodikasi juda yoqdi, murakkab JavaScript mavzularini sodda misollar bilan ko'rsatib berdi.", "rating": 5, "sentiment": "positive", "author": "Sardor (Frontend talabasi)", "source": "datalife:frontend"},
        {"content": "Python ustozi Sipatdinova Nurjamal juda sabrli, hatto dasturlashdan umuman xabari bo'lmaganlarga ham batafsil o'rgatyapti.", "rating": 5, "sentiment": "positive", "author": "Gulbahor (Python)", "source": "datalife:python"},
        {"content": "Kiberxavfsizlik darsida Kayipbaev Ravshan haqiqiy OWASP zaifliklarini amalda ko'rsatib berdi, darslar juda foydali bo'ldi.", "rating": 5, "sentiment": "positive", "author": "Otabek (Security)", "source": "datalife:security"},
        {"content": "Darsdan keyin o'tirib mustaqil kod yozish va jamoaviy ishlash uchun kovorking (coworking) xonasi yetishmayapti.", "rating": 3, "sentiment": "negative", "author": "Alisher (Backend talabasi)", "source": "datalife:infrastructure"},
        {"content": "Backend kursida Node.js va PostgreSQL bilan ishlash yaxshi, lekin Docker va serverga deploy qilish amaliyoti kam o'tildi.", "rating": 3, "sentiment": "negative", "author": "Doston (Backend talabasi)", "source": "datalife:backend"},
        {"content": "O'quv xonalari toza va zamonaviy kompyuterlar bilan jihozlangan, ma'muriyat xushmuomila kutib oladi.", "rating": 5, "sentiment": "positive", "author": "Madina (Grafik dizayn)", "source": "datalife:general"},
        {"content": "Prompt Engineering kursi sun'iy intellekt vositalaridan kundalik ishda qanday foydalanishni 100% tushuntirib berdi.", "rating": 5, "sentiment": "positive", "author": "Farxod (AI kursi)", "source": "datalife:ai"},
    ]

    texts = [f["content"] for f in sample_feedbacks]
    embeddings = await get_embeddings(texts)

    db_items = []
    for idx, f in enumerate(sample_feedbacks):
        db_fb = Feedback(
            project_id=project.id,
            source=f["source"],
            author_name=f["author"],
            content=f["content"],
            rating=f["rating"],
            sentiment=f["sentiment"],
            embedding=embeddings[idx] if idx < len(embeddings) else None
        )
        db_items.append(db_fb)

    db.add_all(db_items)
    db.commit()

    # Automatically trigger initial AI clustering
    try:
        target_fbs = [item for item in db_items if item.sentiment in ["negative", "neutral"]]
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
            for f in target_fbs
        ]
        clusters_dict = cluster_embeddings(items_for_clustering)
        total_target = len(target_fbs)

        for cluster_id, items in clusters_dict.items():
            if not items:
                continue
            impact_pct = round((len(items) / total_target) * 100, 1) if total_target > 0 else 0
            summary_data = await summarize_cluster(items)

            cluster_record = IssueCluster(
                project_id=project.id,
                title=summary_data.get("title", f"Muammolar guruhi #{cluster_id + 1}"),
                root_cause=summary_data.get("root_cause", "O'quvchilar e'tirozlari"),
                severity=summary_data.get("severity", "medium"),
                impact_percentage=impact_pct,
                jira_markdown=summary_data.get("jira_markdown", ""),
                is_resolved=False
            )
            for it in items:
                cluster_record.feedbacks.append(it["obj"])
            db.add(cluster_record)
        db.commit()
    except Exception as e:
        print(f"[Seed Cluster Warning]: {e}")

    f_count = db.query(func.count(Feedback.id)).filter(Feedback.project_id == project.id).scalar() or 0
    c_count = db.query(func.count(IssueCluster.id)).filter(IssueCluster.project_id == project.id).scalar() or 0

    return ProjectResponse(
        id=project.id,
        user_id=project.user_id,
        name=project.name,
        description=project.description,
        platform=project.platform,
        website_url=project.website_url,
        api_key=project.api_key,
        created_at=project.created_at,
        feedbacks_count=f_count,
        clusters_count=c_count
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
        website_url=getattr(project, 'website_url', None),
        api_key=getattr(project, 'api_key', None),
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
