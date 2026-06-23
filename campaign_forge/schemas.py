from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ModuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    category: str
    order: int
    content: str


class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    module_id: int
    completed_at: datetime


class UTMParams(BaseModel):
    url: str
    source: str
    medium: str
    campaign: str
    term: Optional[str] = None
    content: Optional[str] = None


class UTMResult(BaseModel):
    utm_url: str
    params: dict


class ABTestInput(BaseModel):
    visitors_a: int
    conversions_a: int
    visitors_b: int
    conversions_b: int


class ABTestResult(BaseModel):
    rate_a: float
    rate_b: float
    relative_improvement: float
    winner: str
    confidence: str


class BudgetInput(BaseModel):
    total_budget: float
    channels: list[str]


class BudgetResult(BaseModel):
    allocations: dict[str, float]
    total: float
