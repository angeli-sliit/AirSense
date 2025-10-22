from datetime import datetime, timedelta
import os
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
    # Try native upsert; if the DB lacks the unique key, fallback to code-level upsert
    try:
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
    except Exception:
        pass

    # Fallback: INSERT IGNORE, then UPDATE existing by (ts, city, source)
    try:
        ins_sql = text("""
            INSERT IGNORE INTO measurements (ts, city, latitude, longitude, pm25, pm10, source)
            VALUES (:ts, :city, :latitude, :longitude, :pm25, :pm10, :source)
        """)
        db.execute(ins_sql, rows)
        upd_sql = text("""
            UPDATE measurements
               SET latitude=:latitude, longitude=:longitude, pm25=:pm25, pm10=:pm10
             WHERE ts=:ts AND city=:city AND source=:source
        """)
        for r in rows:
            db.execute(upd_sql, r)
        db.commit()
        return len(rows)
    except Exception:
        db.rollback()
        return 0

def _collect_and_upsert(db: Session, city: str, days: int, sources: list[str] | None):
    from .geocode import get_coords_for_city
    from .fetchers.openaq import fetch_openaq
    from .fetchers.iqair import fetch_iqair
    from .fetchers.waqi import fetch_waqi
    from .fetchers.normalize import make_row, parse_ts
    from .aggregate import combine_by_timestamp
    lat, lon = get_coords_for_city(db, city)

    # use datetime today instead of just date
    end = datetime.utcnow().date()   # or datetime.now().date()
    start = end - timedelta(days=days)

    data = fetch_open_meteo(lat, lon, start.isoformat(), end.isoformat())
    rows_open_meteo = flatten_rows(city, lat, lon, data)

    # Toggle additional sources via SOURCES_ENABLED (comma-separated)
    enabled_env = os.getenv('SOURCES_ENABLED', '').lower()
    enabled_set = set([s.strip() for s in enabled_env.split(',') if s.strip()])
    if sources:
        enabled_set = set([s.strip().lower() for s in sources if s and isinstance(s, str)])

    src_rows = {
        'open-meteo': rows_open_meteo
    }

    # Fetch from OpenAQ
    if not enabled_set or 'openaq' in enabled_set:
        try:
            src_rows['openaq'] = fetch_openaq(city, start, end, lat, lon)
        except Exception:
            src_rows['openaq'] = []

    # Fetch from IQAir (HTML)
    if not enabled_set or 'iqair' in enabled_set:
        try:
            src_rows['iqair'] = fetch_iqair(city, start, end, lat, lon)
        except Exception:
            src_rows['iqair'] = []

    # Fetch from WAQI (API if token present, else HTML)
    if not enabled_set or 'waqi' in enabled_set:
        try:
            token = os.getenv('WAQI_TOKEN')
            src_rows['waqi'] = fetch_waqi(city, start, end, lat, lon, token)
        except Exception:
            src_rows['waqi'] = []

    # Aggregate combined signal
    agg_rows = combine_by_timestamp(city, lat, lon, src_rows.get('openaq', []), src_rows.get('iqair', []), src_rows.get('waqi', []), src_rows.get('open-meteo', []))

    # Only save aggregated data, not individual source data
    counts: dict[str, int] = {}
    # Count individual sources for reporting but don't save them
    for k, v in src_rows.items():
        counts[k] = len(v) if v else 0
    
    # Only save the aggregated data to database
    counts['aggregated'] = upsert_rows(db, agg_rows) if agg_rows else 0

    return counts, (lat, lon)


def ensure_window_for_city(db: Session, city: str, days: int, sources: list[str] | None = None):
    counts, coords = _collect_and_upsert(db, city, days, sources)
    total = sum(counts.values())
    return total, coords


def ensure_window_for_city_with_counts(db: Session, city: str, days: int, sources: list[str] | None = None):
    return _collect_and_upsert(db, city, days, sources)
