from datetime import datetime, timedelta
import requests
from sqlalchemy import text
from sqlalchemy.orm import Session

def fetch_open_meteo(lat: float, lon: float, start_date: str, end_date: str):
    url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={lat}&longitude={lon}"
        "&hourly=pm2_5,pm10"
        f"&start_date={start_date}&end_date={end_date}"
        "&timezone=auto"
    )
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        return r.json()
    except requests.Timeout:
        raise RuntimeError("OpenMeteoTimeout: upstream timed out")
    except requests.RequestException as e:
        raise RuntimeError(f"OpenMeteoHTTP: {e}")


def flatten_rows(city: str, lat: float, lon: float, data: dict):
    times = data["hourly"]["time"]
    pm25  = data["hourly"].get("pm2_5")
    pm10  = data["hourly"].get("pm10")
    rows = []
    for i, ts in enumerate(times):
        rows.append({
            "ts": ts.replace("T", " ")+":00",  # MySQL DATETIME
            "city": city,
            "latitude": lat,
            "longitude": lon,
            "pm25": None if pm25 is None else pm25[i],
            "pm10": None if pm10 is None else pm10[i],
            "source": "open-meteo",
        })
    return rows

def upsert_rows(db: Session, rows: list[dict]) -> int:
    if not rows:
        return 0
    sql = text("""
               INSERT INTO measurements (ts, city, latitude, longitude, pm25, pm10, source)
               VALUES (:ts, :city, :latitude, :longitude, :pm25, :pm10, :source)
                   ON DUPLICATE KEY UPDATE
                                        pm25=VALUES(pm25),
                                        pm10=VALUES(pm10),
                                        latitude=VALUES(latitude),
                                        longitude=VALUES(longitude);
               """)
    db.execute(sql, rows)
    db.commit()
    return len(rows)

def ensure_window_for_city(db: Session, city: str, days: int):
    from .geocode import get_coords_for_city
    lat, lon = get_coords_for_city(db, city)

    # use datetime today instead of just date
    end = datetime.utcnow().date()   # or datetime.now().date()
    start = end - timedelta(days=days)

    data = fetch_open_meteo(lat, lon, start.isoformat(), end.isoformat())
    rows = flatten_rows(city, lat, lon, data)
    n = upsert_rows(db, rows)
    return n, (lat, lon)
