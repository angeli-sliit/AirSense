import base64
import os
import io
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from PIL import Image as PILImage  # pillow for dimension reading
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable, PageBreak

from ..schemas import ReportIn


logger = logging.getLogger("airq")


def _decode_base64_image(data_b64: str) -> Optional[bytes]:
    try:
        if not data_b64:
            return None
        if "," in data_b64 and data_b64.strip().lower().startswith("data:image"):
            data_b64 = data_b64.split(",", 1)[1]
        return base64.b64decode(data_b64)
    except Exception as e:
        logger.warning("Failed to decode base64 image: %s", e)
        return None


def _scaled_image(img_bytes: bytes, max_width_pts: float) -> Optional[Image]:
    try:
        with PILImage.open(io.BytesIO(img_bytes)) as pil:
            w, h = pil.size
            if w == 0 or h == 0:
                return None
            scale = max_width_pts / float(w)
            new_w = max_width_pts
            new_h = float(h) * scale
        return Image(io.BytesIO(img_bytes), width=new_w, height=new_h)
    except Exception as e:
        logger.warning("Failed to scale/embed image: %s", e)
        return None


ACCENT = os.getenv("AIRSENSE_ACCENT_HEX", "#22C55E")


def _metrics_table(metrics: Dict[str, Any]) -> Optional[Table]:
    if not metrics:
        return None
    rows = [["Metric", "Value"]]
    for k, v in metrics.items():
        rows.append([str(k).replace("_", " ").title(), str(v)])
    t = Table(rows, hAlign='LEFT')
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor(ACCENT)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
    ]))
    return t


def _stats_table(stats: Dict[str, Any], report_type: Optional[str] = None) -> Optional[Table]:
    if not stats:
        return None
    # Expect shape: { city: { mean_* or mean_yhat, min_*, max_*, n_points } }
    header = ["City", "Mean (µg/m³)", "Range (µg/m³)", "Samples"]
    rows = [header]
    for city, vals in stats.items():
        mean_val = vals.get("mean_pm25")
        if mean_val is None:
            mean_val = vals.get("mean_yhat")
        min_v = vals.get("min_pm25")
        max_v = vals.get("max_pm25")
        n = vals.get("n_points")
        rng = "-"
        if min_v is not None or max_v is not None:
            min_str = f"{min_v:.2f}" if isinstance(min_v, (int, float)) else "-"
            max_str = f"{max_v:.2f}" if isinstance(max_v, (int, float)) else "-"
            rng = f"{min_str} – {max_str}"
        rows.append([
            city,
            f"{mean_val:.2f}" if isinstance(mean_val, (int, float)) else "-",
            rng,
            str(n) if n is not None else "-",
        ])
    t = Table(rows, hAlign='LEFT')
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111827")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor(ACCENT)),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
    ]))
    return t


def make_report(payload: ReportIn) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=16 * mm)
    styles = getSampleStyleSheet()
    # Dark theme paragraph styles to better match UI
    title_style = ParagraphStyle(
        name="TitleDark",
        parent=styles["Title"],
        fontSize=22,
        textColor=colors.HexColor(ACCENT),
        spaceAfter=8,
    )
    h2_style = ParagraphStyle(
        name="Heading2Dark",
        parent=styles["Heading2"],
        textColor=colors.HexColor(ACCENT),
        spaceAfter=6,
    )
    h3_style = ParagraphStyle(
        name="Heading3Dark",
        parent=styles["Heading3"],
        textColor=colors.HexColor(ACCENT),
        spaceAfter=4,
    )
    normal_style = ParagraphStyle(
        name="NormalDark",
        parent=styles["Normal"],
        textColor=colors.HexColor("#D1D5DB"),
    )

    # Spacing constants
    SP_SMALL = 6
    SP_MED = 12
    SP_LARGE = 18

    def separator():
        return HRFlowable(width="100%", thickness=1, lineCap='round', color=colors.HexColor("#374151"), spaceBefore=SP_SMALL, spaceAfter=SP_SMALL)
    story: List[Any] = []  # type: ignore

    # Header
    story.append(Paragraph("<para alignment='center'><b>AirSense</b></para>", title_style))
    story.append(Spacer(1, SP_SMALL))

    # Subtitle
    subtitle = "Forecast Report" if payload.report_type == "forecast" else "City Comparison Report"
    story.append(Paragraph(f"<para alignment='center'><b>{subtitle}</b></para>", h2_style))
    story.append(separator())

    # Timestamp and cities
    ts_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    story.append(Paragraph(f"Generated: {ts_str}", normal_style))
    story.append(Paragraph(f"Cities: {', '.join(payload.cities)}", normal_style))
    story.append(Spacer(1, SP_MED))

    # Metrics block
    if payload.metrics:
        story.append(Paragraph("<b>Metrics</b>", h3_style))
        mt = _metrics_table(payload.metrics)
        if mt:
            story.append(mt)
            story.append(Spacer(1, SP_MED))
            story.append(separator())

    # Stats block
    if payload.stats:
        story.append(Paragraph("<b>Key Stats</b>", h3_style))
        # Forecast range fallback calculation if missing
        if payload.report_type == "forecast":
            try:
                # Try to derive min/max from any available series in metrics or stats hints
                # If not provided, leave as-is; frontend will now send ranges where possible
                for city, vals in list(payload.stats.items()):  # type: ignore
                    rng_text = vals.get("range") if isinstance(vals, dict) else None
                    if rng_text:
                        continue
                    # If we had arrays, we'd compute here; keep placeholder to avoid breaking
                    # e.g., mean series not available in backend currently
                    # Leave None to display '-' in table
            except Exception:
                pass
        st = _stats_table(payload.stats, payload.report_type)
        if st:
            story.append(st)
            story.append(Spacer(1, SP_MED))
            story.append(separator())

    # Charts block
    if payload.charts:
        story.append(Paragraph("<b>Charts</b>", h3_style))
        story.append(Spacer(1, SP_SMALL))

        page_width, _ = A4
        max_w = page_width - (doc.leftMargin + doc.rightMargin)

        charts_on_page = 0

        def add_img_if_present(key: str):
            img_b64 = payload.charts.get(key)
            if not img_b64:
                return
            img_bytes = _decode_base64_image(img_b64)
            if not img_bytes:
                return
            img = _scaled_image(img_bytes, max_w)
            if img:
                story.append(img)
                story.append(Spacer(1, SP_SMALL))
                nonlocal charts_on_page
                charts_on_page += 1
                if charts_on_page >= 2:
                    story.append(PageBreak())
                    charts_on_page = 0

        # Combined first if requested
        show_combined = bool((payload.options or {}).get("showCombined", True))
        if show_combined and "combined" in payload.charts:
            add_img_if_present("combined")

        # Then each city chart in provided order
        for c in payload.cities:
            if c in payload.charts:
                add_img_if_present(c)

    story.append(Spacer(1, SP_LARGE))
    story.append(separator())
    story.append(Paragraph("<para alignment='center'>Generated by AirSense</para>", normal_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()



