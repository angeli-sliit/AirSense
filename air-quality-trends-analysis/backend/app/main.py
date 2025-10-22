from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .core.config import settings
from .core.logging_mw import log_requests
from .routers.compare import router as compare_router
from .routers.forecast import router as forecast_router
from .routers.agent import router as agent_router
from .routers.health import router as health_router
from .routers.report import router as report_router
from .routers.auth import router as auth_router

app = FastAPI(title="AirQ (FastAPI + MySQL + MCP Bridge)")

# Logging (basic)
logger = logging.getLogger("airq")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

# Request logging middleware
app.middleware("http")(log_requests)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(compare_router,  prefix="",       tags=["compare"])
app.include_router(forecast_router, prefix="",       tags=["forecast"])
app.include_router(agent_router,    prefix="/agent", tags=["agent"])
app.include_router(health_router,   prefix="",       tags=["health"])
app.include_router(report_router,   prefix="",       tags=["report"])
app.include_router(auth_router,     prefix="/auth",  tags=["auth"])

