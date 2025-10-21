from sqlalchemy.orm import Session
from sqlalchemy import text

def compare_logic(db: Session, cities: list[str], days: int):
    by_city = {}
    want_end   = "NOW()"
    want_start = f"DATE_SUB({want_end}, INTERVAL {days} DAY)"
    for c in cities:
        rows = db.execute(text(f"""
            SELECT ts, pm25, pm10
            FROM measurements
            WHERE city=:c AND source='aggregated'
              AND ts >= {want_start} AND ts <= {want_end}
            ORDER BY ts
        """), {"c": c}).mappings().all()

        vals = [r["pm25"] for r in rows if r["pm25"] is not None]
        mean_pm25 = (sum(vals)/len(vals)) if vals else None
        min_pm25  = min(vals) if vals else None
        max_pm25  = max(vals) if vals else None

        by_city[c] = {
            "n_points": len(rows),
            "mean_pm25": mean_pm25,
            "min_pm25": min_pm25,
            "max_pm25": max_pm25,
        }

    has_vals = {c:v for c,v in by_city.items() if v["mean_pm25"] is not None}
    best  = min(has_vals, key=lambda k: has_vals[k]["mean_pm25"]) if has_vals else None
    worst = max(has_vals, key=lambda k: has_vals[k]["mean_pm25"]) if has_vals else None
    return {"days": days, "byCity": by_city, "best": best, "worst": worst}
