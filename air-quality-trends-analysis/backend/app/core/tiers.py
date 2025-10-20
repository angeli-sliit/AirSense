from fastapi import HTTPException, Request
from ..schemas import ForecastMultiIn
from .security import Plan, get_plan

def enforce_scrape(plan: Plan, days: int):
    if plan == "free" and days > 7:
        raise HTTPException(403, "Free plan supports up to 7 days. Upgrade for more.")
    if plan == "pro" and days > 30:
        raise HTTPException(403, "Pro plan supports up to 30 days. Enterprise for more.")

def enforce_compare(plan: Plan, cities: list[str], days: int):
    enforce_scrape(plan, days)
    if plan == "free" and len(cities) > 1:
        raise HTTPException(403, "Free plan supports 1 city only. Upgrade for multi-city.")
    if plan == "pro" and len(cities) > 3:
        raise HTTPException(403, "Pro plan supports up to 3 cities. Enterprise for more.")

def enforce_forecast(plan: Plan, horizon_days: int, cities_len: int = 1):
    if plan == "free":
        raise HTTPException(403, "Forecasting is a Pro feature. Upgrade to use forecasting.")
    if plan == "pro":
        if horizon_days > 7:
            raise HTTPException(403, "Pro plan supports forecast horizon up to 7 days.")
        if cities_len > 3:
            raise HTTPException(403, "Pro plan supports up to 3 cities.")

def enforce_tier_limits_for_forecast_multi(payload: ForecastMultiIn, role: str = "pro"):
    if role == "free":
        if len(payload.cities) > 1:
            raise HTTPException(403, "Free tier supports 1 city.")
        if payload.horizonDays > 7:
            raise HTTPException(403, "Free tier supports up to 7-day horizon.")
    if role == "pro":
        if len(payload.cities) > 3:
            raise HTTPException(403, "Pro tier supports up to 3 cities.")
        if payload.horizonDays > 7:
            raise HTTPException(403, "Pro tier supports up to 7-day horizon.")
