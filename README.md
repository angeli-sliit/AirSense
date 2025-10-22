# AirSense — Intelligent Air Quality Analytics Platform
![AirSense Logo](https://img.shields.io/badge/AirSense-Intelligent%20Air%20Quality%20Analytics-blue?style=for-the-badge&logo=cloud)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?logo=mysql&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A comprehensive **full‑stack, agentic** web application for real‑time air quality monitoring, city comparison, forecasting, and branded PDF reporting. Built with **FastAPI**, **React (Vite)**, **MySQL**, and **time‑series ML** (SARIMAX / Prophet), plus an **LLM planner** (Ollama Llama 3.2) for natural‑language workflows.

---

## 🔗 Table of Contents
- [Highlights](#-highlights)
- [Features](#-features)
- [Architecture](#-architecture)
- [System Diagram](#-system-diagram)
- [Repository Structure](#-repository-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Data Sources](#-data-sources)
- [Machine Learning](#-machine-learning)
- [API Reference](#-api-reference)
- [Agentic Flow](#-agentic-flow)
- [Plans \u0026 Security](#-plans--security)
- [Frontend](#-frontend)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [License \u0026 Credits](#-license--credits)

---

## ✨ Highlights
- **Agentic UX (MCP‑style)**: Natural prompts → LLM **plan** → FastAPI **executes tools** (`scrape_city`, `compare_cities`, `forecast_city`, `report`).
- **Analytics**: Multi‑city KPIs (mean/min/max, best/worst), **forecasting with confidence intervals**, and **zero‑clamped** lower bounds for realism.
- **Reporting**: One‑click **PDF reports** (ReportLab) with brand header, KPIs, embedded charts, and **LLM conclusions**.
- **Tiering**: **Free / Pro / Enterprise** usage enforced by headers (`X-Plan`) and API key (`X-API-KEY`).
- **Modern stack**: FastAPI + SQLAlchemy, React + Recharts + Tailwind, **Ollama Llama 3.2** planner, **MySQL 8** persistence.

---

## 🌟 Features

### Core
- **Real‑time Data Collection**: Scrape hourly PM2.5/PM10 from **Open‑Meteo** (primary), with optional fusion of **OpenAQ**, **IQAir**, **WAQI**.
- **City Comparison Analysis**: Compare cities with interactive visualizations and KPIs.
- **AI‑Powered Forecasting**: SARIMAX (fast) and Prophet (rich) for **trend/seasonality** with **confidence intervals**.
- **Agentic AI Assistant**: Natural language → **plan** → **execute**; auto‑renders Compare/Forecast panels.
- **Report Generation**: Automated **PDFs** with charts, insights, recommendations.

### Technical
- **Multi‑source Integration** (4+ APIs)
- **Interactive Visuals**: Recharts, CI bands/dashed bounds
- **Authentication**: JWT (HTTP‑only cookies), RBAC, rate limits
- **Responsive UI**: Tailwind + glassmorphism + subtle particle effects
- **Observability**: Request IDs, structured logging, `/healthz`

---

## 🏗️ Architecture
**React (UI)** → **FastAPI** (CORS, auth, logging, tiering) → **LLM Planner** (Ollama Llama 3.2) → **Tool Executor** → `scraper` / `comparer` / `forecaster` / `reporter` → **MySQL** (measurements + model cache) → **charts + PDF** back to UI.

**External services**: Open‑Meteo (no key), optional OpenAQ/IQAir/WAQI, Ollama (local LLM).

### Backend (FastAPI + Python)
```
backend/
├── app/
│   ├── core/           # Config, security, CORS, logging
│   ├── routers/        # API endpoints
│   ├── services/       # Scraper, forecast, reporter, llama client
│   ├── models.py       # SQLAlchemy ORM models (users, measurements, tokens)
│   └── schemas.py      # Pydantic request/response models
├── models/             # Trained ML models / caches
└── requirements.txt    # Python dependencies
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/     # Reusable UI pieces
│   ├── pages/          # Tabs: Scrape, Compare, Forecast, Assistant, Reports
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Formatters, http client
│   └── contexts/       # Global state
├── public/             # Static assets
└── package.json
```

---

## 🖼️ System Diagram
Mermaid (also available in `docs/architecture.html`):

```mermaid
flowchart LR
  UI[React UI] -->|fetch| API(FastAPI)
  API -->|plan| LLM[Ollama Llama 3.2]
  API -->|exec tools| S1[Scraper]
  API -->|exec tools| S2[Comparer]
  API -->|exec tools| S3[Forecaster]
  API -->|exec tools| S4[Reporter]
  S1 & S2 & S3 --> DB[(MySQL 8)]
  DB --> API
  API -->|JSON \u0026 charts| UI
  API -->|PDF| UI
```

---

## 📁 Repository Structure
```
air-quality-trends-analysis/
├─ backend/
│  ├─ app/
│  │  ├─ main.py               # FastAPI app (routes, MCP bridge, tier gating, agent executor)
│  │  ├─ db.py                 # SQLAlchemy Session + MySQL engine
│  │  ├─ services/
│  │  │  ├─ scraper.py         # Open-Meteo fetch + upsert
│  │  │  ├─ forecast.py        # SARIMAX/Prophet + backtest
│  │  │  ├─ geocode.py         # (optional) city → lat/lon
│  │  │  └─ llama_client.py    # plan_with_llama (Ollama)
│  │  └─ models/               # (optional) model cache
│  ├─ requirements.txt
│  └─ .env.example
├─ frontend/
│  ├─ index.html
│  ├─ src/App.jsx              # Tabs: Scrape, Compare, Forecast, Assistant, Reports
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

## 🚀 Quick Start

### Prerequisites
- **Python** 3.10+ (3.8+ works), **Node.js** 16+ (18+ recommended)
- **MySQL 8** (XAMPP friendly)
- **Ollama** with `llama3.2` model (for agentic planner)

### Backend Setup
```bash
cd backend
python -m venv .venv
# Windows
. .venv/Scripts/activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access
- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:8000  
- **API Docs:** http://localhost:8000/docs

---

## ⚙️ Configuration

### Database (MySQL)
Create DB and table:
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

### Environment Variables
Create `backend/app/.env` (or OS env):
```
# Core DB
DATABASE_URL=mysql+pymysql://root:password@127.0.0.1:3306/airsense

# Auth / JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_MIN=60
COOKIE_DOMAIN=localhost
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Plans / API
API_KEY=dev-key-123
DEFAULT_PLAN=free

# Agent / LLM
OLLAMA_BASE=http://127.0.0.1:11434
LLAMA_MODEL=llama3.2
```

> **Tip:** Set `DEFAULT_PLAN=enterprise` locally to test unrestricted flows.

---

## 📊 Data Sources
- **Open‑Meteo**: Primary hourly PM2.5/PM10 (no API key).
- **OpenAQ**: Global community/official stations.
- **IQAir**: Real‑time air quality (licensed).
- **WAQI**: World Air Quality Index.

The scraper is implemented against **Open‑Meteo** by default, with optional adapters for the others.

---

## 🤖 Machine Learning

### SARIMAX (default)
- **Goal**: Fast, lightweight per‑city forecasting
- **Strengths**: Seasonal patterns, trend handling
- **Best for**: Real‑time predictions with minimal compute

### Prophet (optional)
- **Goal**: Richer seasonality/holiday modeling
- **Strengths**: Trend change points, holiday effects
- **Best for**: Complex seasonal behavior

**Forecast Output**
```
[ { ts, yhat, yhat_lower, yhat_upper } ]
```
- Lower bound **clamped to 0 µg/m³** for physical realism.
- UI renders CI as shaded bands or dashed bounds; Y‑axis domain `[0, 'auto']`.

**KPIs (Compare)**
- `n_points`, `mean_pm25`, `min_pm25`, `max_pm25`, **best**/**worst** by mean.

---

## 📚 API Reference

### Headers
- `X-API-KEY: dev-key-123`
- `X-Plan: free | pro | enterprise`

### Core Endpoints
- `POST /scrape` — `{ "city": "Colombo", "days": 7 }`
- `POST /compare` — `{ "cities": ["Colombo","Kandy"], "days": 7 }`
- `POST /forecast` — `{ "city": "Kandy", "horizonDays": 7, "trainDays": 30 }`
- `POST /forecast/multi` — `{ "cities": ["Colombo","Kandy"], "horizonDays": 7, "trainDays": 30 }`
- `POST /agent/plan` — `{ "prompt": "Compare Colombo and Kandy last 7 days then forecast both next 7 days" }`
- `POST /agent/execute` — `{ "plan": [...] }` **or** `{ "prompt": "..." }`
- `POST /report` — `{ report_type, payload, llm_notes, chart_images? }`
- `GET /healthz` — DB + Open‑Meteo check

### Authentication
- `POST /auth/signup` — user registration
- `POST /auth/signin` — login
- `POST /auth/refresh` — refresh JWT

**Curl Example**
```bash
curl -X POST http://localhost:8000/compare \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: dev-key-123" \
  -H "X-Plan: enterprise" \
  -d '{"cities":["Colombo","Kandy"],"days":7}'
```

---

## 🧠 Agentic Flow
1. **Plan** (`/agent/plan`): LLM (Llama 3.2 via Ollama) produces a JSON plan, e.g.:
   ```json
   {"plan":[
     {"name":"scrape_city","arguments":{"city":"Colombo","days":7}},
     {"name":"compare_cities","arguments":{"cities":["Colombo","Kandy"],"days":7}},
     {"name":"forecast_multi","arguments":{"cities":["Colombo","Kandy"],"horizonDays":7,"trainDays":30}}
   ]}
   ```
2. **Execute** (`/agent/execute`): The backend walks the steps, **enforcing plan limits**, returns a **trace** and `final` result.
3. **UI Sync**: The frontend updates Compare/Forecast state, pre‑fills inputs, renders charts, and enables **PDF export** with LLM notes.

---

## 🔐 Plans & Security

### User Plans
- **Free**: 1 city, ≤ 7 days lookback, **no forecasting**
- **Pro**: ≤ 3 cities, ≤ 30 days lookback, **forecast horizon ≤ 7 days**
- **Enterprise**: Unlimited cities, ≤ 90 days lookback, **forecast horizon ≤ 30 days**

### Enforcement
- `enforce_scrape(days)` → Free ≤ 7, Pro ≤ 30, Ent ≤ 90
- `enforce_compare(cities, days)` → Free: 1 city; Pro: ≤ 3
- `enforce_forecast(horizon, cities_len)` → Free: blocked; Pro: horizon ≤ 7, cities ≤ 3

### Security Features
- JWT auth with **HTTP‑only cookies**
- Role‑based access control
- API rate limiting
- CORS allowlist
- Structured logging with request IDs

---

## 🖥️ Frontend
- **React + Vite + Tailwind** UI with tabs: **Scrape**, **Compare**, **Forecast**, **AI Assistant**, **Reports**.
- Always send `X-API-KEY` and `X-Plan` in requests.
- Charts via **Recharts**; units **µg/m³**; CI visualization; zero‑clamped lower bounds.

**Include charts in PDF**
```js
const svg = document.querySelector('#forecast-chart svg');
const b64 = btoa(new XMLSerializer().serializeToString(svg));
await fetch('/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-API-KEY': 'dev-key-123', 'X-Plan': 'enterprise' },
  body: JSON.stringify({ report_type: 'forecast', payload: fcRes, llm_notes: agentOut?.answer, chart_images: [b64] })
});
```

---

## 🚀 Deployment

### Backend
1. Set **MySQL** and create schema.
2. Configure **environment variables**.
3. Install Python deps: `pip install -r requirements.txt`.
4. Run migrations (or execute the provided `CREATE TABLE`).
5. Start FastAPI: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

### Frontend
1. Build: `npm run build`
2. Serve: any static server (Nginx, Vercel, Netlify)
3. Configure API base URL (e.g., `VITE_API_URL` if used).

---

## 🆘 Troubleshooting

**Database Connection**
- Verify MySQL service is running.
- Check `DATABASE_URL` in `.env`.
- Confirm DB `airsense` exists and user has privileges.

**Auth / CORS**
- Ensure `JWT_SECRET` is set.
- `COOKIE_DOMAIN` must match environment.
- Include frontend origins in `ALLOWED_ORIGINS`.

**Frontend**
- If using a custom env var, set `VITE_API_URL` to backend origin.
- Confirm backend port (default **8000**).
- Check network devtools for CORS or 401 errors.

**Agent / Ollama**
- Install **Ollama**, `ollama pull llama3.2`.
- Ensure `OLLAMA_BASE` is reachable.

---

## 🗺️ Roadmap
- [ ] Real‑time notifications
- [ ] Mobile app
- [ ] Advanced ML models (LightGBM/Neural)
- [ ] Historical deep‑dives (AQI buckets, diurnal patterns, WHO exceedance %)
- [ ] IoT sensor ingestion
- [ ] Auth‑backed tenant plans (link users ↔ `X-Plan`)
- [ ] CI/CD and unit tests

---

## 🧾 License & Credits
**License**: MIT — see `LICENSE`.

**Credits**
- **Open‑Meteo** Air Quality API
- **OpenAQ**, **IQAir**, **WAQI** (optional integrations)
- **Ollama** (Llama 3.2 local LLM)
- **FastAPI**, **SQLAlchemy**, **ReportLab**, **Recharts**, **Tailwind**

---

### TL;DR
```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# LLM
ollama pull llama3.2
ollama run llama3.2

# Frontend
cd ../frontend && npm i && npm run dev
# open http://localhost:5173

# Agent prompt
"Compare Colombo and Kandy last 7 days, then forecast both next 7 days."
```

## 👥 Contributors & Maintainers

> Add your team here. Keep this table updated in PRs. Use any avatar URL (GitHub works).

| Avatar | Name | Component | Focus Areas | GitHub |
|---|---|---|---|---|
| <img src="https://github.com/dyneth02.png?size=84" width="42" /> | **Dyneth Hirusha** | Forecaster | SARIMAX/Prophet, backtesting, CI bands | [dyneth02](https://github.com/dyneth02) |
| <img src="https://github.com/angeli-sliit.png?size=84" width="42" /> | **Angeli Wickrama Arachchige** | Scraper | Open‑Meteo integration, upsert to MySQL, data caching | [angeli-sliit](https://github.com/angeli-sliit) |
| <img src="https://github.com/code-sleek.png?size=84" width="42" /> | **Yashodha Cooray** | MCP Client | Agent planner (Ollama), plan→execute bridge, UI wiring | [code-sleek](https://github.com/code-sleek) |
| <img src="https://github.com/OshadhiLg.png?size=84" width="42" /> | **Oshadhi Liyanage** | Analyzer | KPIs/Compare module, data QA, PDF insights | [OshadhiLg](https://github.com/OshadhiLg) |

