from typing import Optional, Literal
from fastapi import Request, Header, HTTPException
from .config import settings

Plan = Literal["free", "pro", "enterprise"]

def require_api_key(req: Request):
    if req.headers.get("X-API-KEY") != settings.API_KEY:
        raise HTTPException(401, "Missing/invalid API key")

def get_plan(x_plan: Optional[str] = Header(None)) -> Plan:
    plan = (x_plan or settings.DEFAULT_PLAN).strip().lower()
    if plan not in {"free", "pro", "enterprise"}:
        plan = "free"
    return plan  # type: ignore
