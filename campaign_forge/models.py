from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from campaign_forge.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    progress = relationship("Progress", back_populates="user", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    order = Column(Integer, nullable=False, default=0)
    content = Column(Text, nullable=False)
    progress = relationship("Progress", back_populates="module", cascade="all, delete-orphan")


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    completed_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="progress")
    module = relationship("Module", back_populates="progress")
