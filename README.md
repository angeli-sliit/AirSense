# AirSense — Agentic Air Quality Trend Analysis  
_Scraper • Pattern Analyzer • Forecaster • PDF Reporter (FastAPI + React + MySQL + MCP + Ollama Llama 3.2)_

> An end-to-end, agentic web app that scrapes hourly air-quality (PM2.5/PM10) from Open-Meteo, caches to MySQL, compares cities with KPIs, forecasts with confidence intervals, and exports branded PDF reports with LLM commentary.

---

## ✨ Highlights

- **Agentic UX (MCP-style)**: Natural prompts → LLM (Llama 3.2 via **Ollama**) produces a tool plan → FastAPI executes steps (`scrape_city`, `compare_cities`, `forecast_city`, `forecast_multi`).
- **Analytics**: Compare cities (mean/min/max, best/worst), forecast with **SARIMAX** + **confidence intervals**, clamp negatives to 0 µg/m³.
- **Full stack**: **FastAPI** backend, **React + Recharts + Tailwind** frontend, **MySQL** persistence (XAMPP-friendly).
- **Reporting**: Beautiful **PDF** reports (ReportLab) with branded header, KPIs table, embedded charts, and LLM conclusion.
- **Tiering**: Free / Pro / Enterprise enforced by headers (`X-Plan`) and API key (`X-API-KEY`).
- **Ops**: Logging with request IDs, CORS, `/healthz` checks for DB and Open-Meteo.

---

## 📁 Repository Structure

```
air-quality-trends-analysis/
├─ backend/
│  ├─ app/
│  │  ├─ main.py               # FastAPI app (routes, MCP bridge, tier gating, agent executor)
│  │  ├─ db.py                 # SQLAlchemy Session + MySQL engine
│  │  ├─ services/
│  │  │  ├─ scraper.py         # Open-Meteo fetch + upsert to MySQL
│  │  │  ├─ forecast.py        # SARIMAX training/forecast/backtest
│  │  │  ├─ geocode.py         # (optional) city → lat/lon
│  │  │  └─ llama_client.py    # plan_with_llama (Ollama Llama 3.2)
│  │  └─ models/               # (optional) ORM models or file cache for SARIMAX
│  ├─ requirements.txt
│  └─ .env.example
├─ frontend/
│  ├─ index.html
│  ├─ src/
│  │  └─ App.jsx               # Tabs: Data Scraping, City Analysis, Forecast, AI Assistant, Reports
│  ├─ package.json
│  └─ tailwind.config.js
├─ docs/
│  ├─ architecture.html        # Mermaid architecture diagram
│  └─ pricing/
│     ├─ pricing.html
│     └─ pricing.css
└─ README.md
```

---

## 🧠 System Architecture (bird’s-eye)

**React (UI)** → **FastAPI** (CORS, logging, tier/auth) → **LLM Planner** (Ollama Llama 3.2) → **Tool Executor** → `scraper`/`comparer`/`forecaster` services → **MySQL** (measurements) + model cache → results & trace → **charts + PDF** → user.

- External services: **Open-Meteo** (hourly PM2.5/PM10), **Ollama** (local LLM).
- Confidence intervals (CI) are visualized as dashed lines or shaded bands; lower bound is clamped to **0 µg/m³**.

> See `/docs/architecture.html` for a mermaid diagram.

---

## 🧩 Features

- **Scrape**: Last N days (7–90) per city, hourly PM2.5/PM10 → persisted in MySQL.
- **Compare**: Multi-city KPIs over a window:  
  `n_points`, `mean_pm25`, `min_pm25`, `max_pm25`, **best** (lowest mean), **worst** (highest mean).
- **Forecast**: SARIMAX per city, next H days with CI (`yhat_lower`/`yhat_upper`); multi-city ranking by mean predicted PM2.5.
- **Agentic**: Natural prompt → plan → execute → auto-renders Compare/Forecast panels.
- **Reports**: PDF with branding, KPIs, embedded charts, PM2.5 explainer, LLM conclusion.
- **Tiering**: 
  - **Free**: 1 city, scrape ≤ 7 days, **no forecasting**  
  - **Pro**: ≤ 3 cities, scrape ≤ 30 days, forecast horizon ≤ 7 days  
  - **Enterprise**: Unlimited cities, scrape ≤ 90 days, forecast horizon ≤ 30 days

---

## 🔧 Requirements

- Python 3.10+ (recommended), Node 18+, MySQL 8 (XAMPP works), **Ollama** with **llama3.2** pulled.
- Open-Meteo (no key required).
- OS: Windows/macOS/Linux.

---

## ⚙️ Backend Setup (FastAPI + MySQL)

1) **Create & activate venv**
```bash
cd backend
python -m venv .venv
# Windows
. .venv/Scripts/activate
# macOS/Linux
source .venv/bin/activate
```

2) **Install**
```bash
pip install -r requirements.txt
```

3) **MySQL**
- Start MySQL (XAMPP or local service).
- Create DB & table:
```sql
CREATE DATABASE airsense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE airsense;

CREATE TABLE measurements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(128) NOT NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  ts DATETIME NOT NULL,
  pm25 DOUBLE NULL,
  pm10 DOUBLE NULL,
  source VARCHAR(64) DEFAULT 'open-meteo',
  UNIQUE KEY uniq_city_ts (city, ts, source)
);
```

4) **Environment** (`backend/app/.env` or OS env)
```
DATABASE_URL=mysql+pymysql://root:password@127.0.0.1:3306/airsense
API_KEY=dev-key-123
ALLOWED_ORIGINS=http://localhost:5173
DEFAULT_PLAN=enterprise
OLLAMA_BASE=http://127.0.0.1:11434
LLAMA_MODEL=llama3.2
```

5) **Run backend**
```bash
uvicorn app.main:app --reload --port 8000
```

6) **Ollama (LLM)**
```bash
# install Ollama from https://ollama.ai
ollama pull llama3.2
ollama run llama3.2
```

---

## 🌐 API (Quick Reference)

Headers (required from frontend/clients):
- `X-API-KEY: dev-key-123`
- `X-Plan: free | pro | enterprise`

Key endpoints:
- `POST /scrape` `{ "city": "Colombo", "days": 7 }`
- `POST /compare` `{ "cities": ["Colombo","Kandy"], "days": 7 }`
- `POST /forecast` `{ "city": "Kandy", "horizonDays": 7, "trainDays": 30 }`
- `POST /forecast/multi` `{ "cities": ["Colombo","Kandy"], "horizonDays": 7, "trainDays": 30 }`
- `POST /agent/plan` `{ "prompt": "Compare Colombo and Kandy for last 7 days then forecast both next 7 days" }`
- `POST /agent/execute` `{ "plan": [...] }` **or** `{ "prompt": "..." }`
- `POST /report` `{ report_type, payload, llm_notes, chart_images? }`
- `GET /healthz`

Example curl:
```bash
curl -X POST http://localhost:8000/compare   -H "Content-Type: application/json" -H "X-API-KEY: dev-key-123" -H "X-Plan: enterprise"   -d '{"cities":["Colombo","Kandy"],"days":7}'
```

---

## 🖥️ Frontend Setup (React + Vite + Tailwind)

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

- **App.jsx** implements tabs for Data Scraping, City Analysis, Forecast, AI Assistant, Reports.
- Uses **fetch** to call backend; always send `X-API-KEY` and `X-Plan` headers.
- Charts: **Recharts** multi-line with **µg/m³** formatting; CI shown as dashed lines or shaded bands.
- CI visualization clamps negative lower bound to **0** and sets Y-axis `domain={[0,'auto']}`.

---

## 🤖 Agentic Flow (MCP-style)

1. **Plan**: `/agent/plan` calls Llama 3.2 to produce a JSON plan with steps like:
   ```json
   { "plan": [
     { "name": "scrape_city", "arguments": { "city": "Colombo", "days": 7 } },
     { "name": "compare_cities", "arguments": { "cities": ["Colombo","Kandy"], "days": 7 } },
     { "name": "forecast_multi", "arguments": { "cities": ["Colombo","Kandy"], "horizonDays": 7, "trainDays": 30 } }
   ]}
   ```
2. **Execute**: `/agent/execute` walks the steps, enforcing tier limits, returning a **trace** and a `final` result (the last successful step).
3. **UI sync**: On Execute, the frontend updates Compare and Forecast state, pre-fills inputs, and renders charts.

---

## 📊 KPIs (Compare)

For each city and window:
- `n_points` (count of hourly samples),
- `mean_pm25`, `min_pm25`, `max_pm25` (µg/m³),
- `best` / `worst` (lowest/highest mean).

---

## 📈 Forecasting

- **Model**: SARIMAX per city (fit on training window).
- **Output**: `series: [ { ts, yhat, yhat_lower, yhat_upper } ]`.
- **Clamping**: `yhat_lower` is clamped to **0 µg/m³** for physical realism.
- **Visualization**: multi-city lines + optional CI bands/dashed bounds.

---

## 🧾 PDF Reports

Endpoint: `POST /report`  
Body:  
```json
{
  "report_type": "comparison" | "forecast",
  "payload": { ...backend_result },
  "llm_notes": "AI summary text",
  "chart_images": ["<base64-encoded-svg-or-png>", "..."]  // optional
}
```

- Backend builds a PDF (ReportLab) with:
  - Brand: **AirSense**
  - Type: Comparison/Forecast
  - City list
  - KPIs table (means, range, points)
  - Charts (combined and/or per-city; forecast may include CI visuals)
  - Metadata (window, horizon, training)
  - PM2.5 explainer
  - **LLM Conclusion** (from `llm_notes`)

**Frontend tip:** to include charts,
```js
const svg = document.querySelector('#forecast-chart svg');
const b64 = btoa(new XMLSerializer().serializeToString(svg));
await fetch('/report', { body: JSON.stringify({ report_type:'forecast', payload: fcRes, llm_notes: agentOut?.answer, chart_images:[b64] }) })
```

---

## 🔐 Tier Enforcement (maps to business model)

- **Headers** drive rules: `X-Plan: free|pro|enterprise`.
- `enforce_scrape(plan, days)` → Free ≤ 7d, Pro ≤ 30d, Ent ≤ 90d
- `enforce_compare(plan, cities, days)` → Free: 1 city; Pro: ≤ 3 cities
- `enforce_forecast(plan, horizon, cities_len)` → Free: blocked; Pro: horizon ≤ 7, cities ≤ 3; Ent: no limits

---

## 🧪 Testing

- **Postman / Thunder Client**: import requests, set headers (`X-API-KEY`, `X-Plan`).
- **Health**: `GET /healthz` checks DB and Open-Meteo.
- **Sanity**: scrape → compare → forecast for 2–3 cities; verify chart and CI; download PDF.

---

## 🛡️ Responsible AI

- **Transparency**: Confidence intervals displayed and explained.
- **Fairness**: Tiering prevents resource abuse by free users.
- **Ethics**: Open, non-personal data; negative PM values clamped to 0.
- **Explainability**: LLM narrates findings in natural language; plan/trace visible.

---

## 🚧 Known Limitations / Future Roadmap

- Model choice (SARIMAX) can be replaced by Prophet/LightGBM/Neural models.
- Geocoding fallback (Nominatim) can be added for city → lat/lon.
- Advanced KPIs: WHO threshold exceedance %, AQI buckets, diurnal patterns.
- Auth (JWT + users table) to gate `X-Plan` per account.
- Cloud deploy: Docker + Render/Fly/DigitalOcean; managed MySQL.
- CI/CD with GitHub Actions; unit tests for tools & forecasting.

---

## 🖼️ Screenshots (placeholders)

Add images to `/docs/screenshots/` and reference here:
- City Compare (KPIs + chart)
- Multi-City Forecast (lines + CI)
- AI Assistant (plan + trace)
- PDF Report sample

---

## 📄 License

MIT (or your preferred license). See `LICENSE`.

---

## 🙌 Credits

- **Open-Meteo** Air Quality API  
- **Ollama** (Llama 3.2 local LLM)  
- **FastAPI**, **SQLAlchemy**, **ReportLab**, **Recharts**, **Tailwind**  

---

### Quick Start (TL;DR)

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# configure .env (DB, API_KEY)
uvicorn app.main:app --reload --port 8000

# LLM
ollama pull llama3.2
ollama run llama3.2

# Frontend
cd ../frontend && npm i && npm run dev
```

Open: `http://localhost:5173` → use AI Assistant:
> “Compare Colombo and Kandy last 7 days, then forecast both next 7 days.”  
Click **Plan** → **Execute** → view charts → **Download PDF**.
