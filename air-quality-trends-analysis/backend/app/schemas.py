from pydantic import BaseModel, conint, Field
from typing import Optional, Dict, Any, List, Literal

# Inputs
class CityWindowIn(BaseModel):
    city: str
    days: conint(ge=1, le=90) = 7
    sources: Optional[list[str]] = None

class CompareIn(BaseModel):
    cities: list[str]
    days: conint(ge=1, le=90) = 7

class ForecastIn(BaseModel):
    city: str
    horizonDays: conint(ge=1, le=30) = 7
    trainDays: conint(ge=7, le=120) = 30
    use_cache: bool = True

class ForecastMultiIn(BaseModel):
    cities: list[str]
    horizonDays: conint(ge=1, le=30) = 7
    trainDays: conint(ge=7, le=120) = 30
    use_cache: bool = True

class AgentPlanIn(BaseModel):
    prompt: str = Field(..., description="Natural language task")

class ToolStep(BaseModel):
    name: str
    arguments: dict = {}

class AgentPlanOut(BaseModel):
    plan: list[ToolStep]
    notes: str | None = None
    irrelevant: bool = False
    reason: str | None = None

class AgentExecIn(BaseModel):
    prompt: str | None = None
    plan: list[ToolStep] | None = None

class AgentExecOut(BaseModel):
    answer: str
    trace: list
    final: dict | None = None

class ReportRequest(BaseModel):
    report_type: str
    payload: dict
    llm_notes: str | None = None
    chart_images: list[str] | None = None


class ReportIn(BaseModel):
    report_type: Literal["forecast", "comparison"]
    cities: List[str]
    metrics: Optional[Dict[str, Any]] = None
    stats: Optional[Dict[str, Any]] = None
    charts: Dict[str, str]
    options: Optional[Dict[str, Any]] = None
