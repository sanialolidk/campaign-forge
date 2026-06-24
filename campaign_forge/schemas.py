from pydantic import BaseModel, ConfigDict, EmailStr, field_validator, model_validator
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


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

    @field_validator("url")
    @classmethod
    def url_must_be_http(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v

    @field_validator("source", "medium", "campaign")
    @classmethod
    def required_fields_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class UTMResult(BaseModel):
    utm_url: str
    params: dict


class ABTestInput(BaseModel):
    visitors_a: int
    conversions_a: int
    visitors_b: int
    conversions_b: int

    @model_validator(mode="after")
    def conversions_cannot_exceed_visitors(self) -> "ABTestInput":
        if self.conversions_a > self.visitors_a:
            raise ValueError("Conversions A cannot exceed visitors A")
        if self.conversions_b > self.visitors_b:
            raise ValueError("Conversions B cannot exceed visitors B")
        return self


class ABTestResult(BaseModel):
    rate_a: float
    rate_b: float
    relative_improvement: float
    winner: str
    confidence: str


class BudgetInput(BaseModel):
    total_budget: float
    channels: list[str]

    @field_validator("channels")
    @classmethod
    def channels_not_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("Select at least one channel")
        return v

    @field_validator("total_budget")
    @classmethod
    def budget_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Budget must be greater than zero")
        return v


class BudgetResult(BaseModel):
    allocations: dict[str, float]
    total: float
