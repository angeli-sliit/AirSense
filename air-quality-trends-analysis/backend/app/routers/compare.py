from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..schemas import CityWindowIn, CompareIn
from ..core.security import get_plan, Plan
from ..core.tiers import enforce_scrape, enforce_compare
from ..services.scraper import ensure_window_for_city
from ..utils.compare import compare_logic

router = APIRouter()

@router.post("/scrape")
def scrape_city(payload: CityWindowIn, plan: Plan = Depends(get_plan), db: Session = Depends(get_db)):
    enforce_scrape(plan, payload.days)
    inserted, (lat, lon) = ensure_window_for_city(db, payload.city, payload.days)
    return {"ok": True, "city": payload.city, "inserted": inserted, "lat": lat, "lon": lon}

@router.post("/compare")
def compare_cities(payload: CompareIn, plan: Plan = Depends(get_plan), db: Session = Depends(get_db)):
    if not payload.cities:
        raise HTTPException(400, "No cities provided")
    enforce_compare(plan, payload.cities, payload.days)
    for c in payload.cities:
        ensure_window_for_city(db, c, payload.days)
    return {"ok": True, **compare_logic(db, payload.cities, payload.days)}
