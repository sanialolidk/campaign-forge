from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from campaign_forge.db import get_db
from campaign_forge.api.auth import get_current_user
from campaign_forge.models import Module, Progress, User
from campaign_forge.schemas import ModuleResponse, ProgressResponse

router = APIRouter()


@router.get("", response_model=List[ModuleResponse])
def list_modules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Module).order_by(Module.order).all()


@router.get("/progress/me", response_model=List[ProgressResponse])
def my_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Progress).filter(Progress.user_id == current_user.id).all()


@router.get("/{slug}", response_model=ModuleResponse)
def get_module(slug: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    module = db.query(Module).filter(Module.slug == slug).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.post("/{slug}/complete", response_model=ProgressResponse, status_code=201)
def complete_module(slug: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    module = db.query(Module).filter(Module.slug == slug).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    existing = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.module_id == module.id,
    ).first()
    if existing:
        return existing
    progress = Progress(user_id=current_user.id, module_id=module.id)
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress
