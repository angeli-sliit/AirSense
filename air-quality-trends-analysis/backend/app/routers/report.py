from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..schemas import ReportIn
from ..services.reporter import make_report


router = APIRouter()


@router.post("/report/generate")
def generate_report(payload: ReportIn, db: Session = Depends(get_db)):
    pdf_bytes = make_report(payload)
    filename = f"{payload.report_type}_report.pdf"
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


