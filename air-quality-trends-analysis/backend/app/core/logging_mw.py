import time, uuid, logging
from fastapi import Request

logger = logging.getLogger("airq")

async def log_requests(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start = time.perf_counter()
    try:
        response = await call_next(request)
        return response
    finally:
        dur_ms = (time.perf_counter() - start) * 1000
        logger.info(f"{req_id} {request.method} {request.url.path} -> {dur_ms:.1f}ms")
        try:
            response.headers["X-Request-ID"] = req_id
        except Exception:
            pass
