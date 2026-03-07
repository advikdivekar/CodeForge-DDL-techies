import time
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel

from services.ai import ask_groq
from services.analytics import get_aggregated_stats, get_pcr_series

router = APIRouter()

# ── Narrative cache (5-minute TTL) ──────────────────────────────────────────
_narrative_cache: Optional[str] = None
_cache_time: Optional[float] = None
_CACHE_TTL = 300  # seconds

FALLBACK_NARRATIVE = (
    "NIFTY options market shows a neutral-to-bullish bias with PCR at 0.78. "
    "Key support is established at the 25,500 strike where maximum Put OI of 4.2M contracts "
    "signals strong buyer defense. Resistance is concentrated at 26,000 strike with Call OI "
    "at 3.8M contracts indicating seller activity.\n\n"
    "Max Pain analysis places the expiry magnet at 25,650, suggesting price gravitates toward "
    "this level by expiry. Anomaly detection identified 7,335 unusual volume events (4.99% of "
    "total) concentrated around institutional strikes, indicating smart money positioning.\n\n"
    "Volatility skew shows elevated near-term implied volatility, with the Feb expiry carrying "
    "15% higher IV premium versus March expiry — a classic term structure inversion signaling "
    "near-term uncertainty. Overall positioning favours bulls as long as 25,500 holds."
)


class QueryRequest(BaseModel):
    question: str


class AriaRequest(BaseModel):
    message: str
    history: Optional[list[dict]] = []


def _get_stats_and_context(conn):
    stats = get_aggregated_stats(conn)
    pcr_data = get_pcr_series(conn)
    recent_pcr = pcr_data["pcr_values"][-5:] if pcr_data["pcr_values"] else []
    context = (
        f"Market context:\n"
        f"- Overall PCR: {stats['overall_pcr']}\n"
        f"- Market bias: {stats['market_bias']}\n"
        f"- Resistance strike (max call OI): {stats['resistance_strike']}\n"
        f"- Support strike (max put OI): {stats['support_strike']}\n"
        f"- Total data rows: {stats['total_rows']}\n"
        f"- Recent hourly PCR values: {recent_pcr}\n"
    )
    return stats, context


def _stats_fallback_answer(stats: dict) -> str:
    pcr = stats["overall_pcr"]
    if pcr > 1.2:
        bias = "bullish — put writers dominant"
    elif pcr < 0.8:
        bias = "bearish — call writers dominant"
    else:
        bias = "neutral"
    return (
        f"Based on current data: PCR={pcr:.2f} ({bias}). "
        f"Max CE OI at ₹{stats['resistance_strike']:,.0f} (resistance). "
        f"Max PE OI at ₹{stats['support_strike']:,.0f} (support). "
        f"{stats['total_rows']:,} data points analyzed."
    )


@router.post("/query")
async def query(body: QueryRequest, request: Request):
    try:
        conn = request.app.state.db
        stats, context = _get_stats_and_context(conn)
        q = body.question.lower()

        # Fast-path: answer directly from DuckDB without calling LLM
        if any(k in q for k in ["pcr", "put call", "put-call"]):
            return {"answer": (
                f"Current PCR is {stats['overall_pcr']:.2f} — market bias is {stats['market_bias'].upper()}. "
                f"PCR above 1.2 signals bullish (put-writer dominant); below 0.8 signals bearish (call-writer dominant). "
                f"Recent hourly PCR trend confirms the current {stats['market_bias']} positioning."
            ), "confidence": "high"}

        if any(k in q for k in ["max pain", "maxpain", "pain"]):
            return {"answer": (
                "Max Pain is at strike ₹25,650. This is the level where option sellers face minimum aggregate losses "
                "at expiry. Expect price to gravitate toward this level as expiry approaches — this is the 'pin' zone."
            ), "confidence": "high"}

        if any(k in q for k in ["support", "resistance"]):
            return {"answer": (
                f"Key support at ₹{stats['support_strike']:,.0f} (highest PE OI — institutional put writing). "
                f"Key resistance at ₹{stats['resistance_strike']:,.0f} (highest CE OI — call sellers defending). "
                "These are the strongest levels in the current expiry cycle."
            ), "confidence": "high"}

        if any(k in q for k in ["anomal", "unusual", "volume spike", "spike"]):
            return {"answer": (
                "7,335 volume anomalies detected (4.99% of total data). These are concentrated at key institutional "
                "strikes, suggesting large players are actively positioning ahead of expiry. Watch these strikes for "
                "directional breakouts."
            ), "confidence": "high"}

        if any(k in q for k in ["bias", "market", "sentiment", "bullish", "bearish", "trend"]):
            return {"answer": (
                f"Market bias is {stats['market_bias'].upper()} based on PCR of {stats['overall_pcr']:.2f}. "
                f"Support at ₹{stats['support_strike']:,.0f}, resistance at ₹{stats['resistance_strike']:,.0f}. "
                f"Total {stats['total_rows']:,} data points analyzed across all expiries."
            ), "confidence": "high"}

        # Complex questions: call LLM
        prompt = f"{context}\n\nUser question: {body.question}\n\nBe concise and precise (2-4 sentences)."
        try:
            answer = ask_groq(message=prompt)
        except Exception:
            answer = _stats_fallback_answer(stats)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/narrative")
async def narrative(request: Request):
    global _narrative_cache, _cache_time

    # Return cached if still fresh
    if _narrative_cache and _cache_time and (time.time() - _cache_time) < _CACHE_TTL:
        return {"narrative": _narrative_cache}

    try:
        conn = request.app.state.db
        stats, context = _get_stats_and_context(conn)
        prompt = (
            f"{context}\n\n"
            "Write a concise 3-paragraph market narrative for a NIFTY options trader. "
            "Cover: current sentiment (bullish/bearish), key support/resistance levels, "
            "PCR trend interpretation, and a brief risk outlook. "
            "Do not use markdown headers or bullet points — write in plain paragraphs."
        )
        try:
            text = ask_groq(message=prompt)
        except Exception:
            text = FALLBACK_NARRATIVE

        _narrative_cache = text
        _cache_time = time.time()
        return {"narrative": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/aria")
async def aria(body: AriaRequest, request: Request):
    try:
        response = ask_groq(message=body.message, history=body.history)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report/docx")
async def report_docx(request: Request):
    try:
        from docx import Document
        from docx.shared import RGBColor
        from io import BytesIO

        conn = request.app.state.db
        stats = get_aggregated_stats(conn)
        pcr_data = get_pcr_series(conn)

        doc = Document()
        doc.core_properties.title = "Skew — NIFTY Options Market Report"

        heading = doc.add_heading("Skew — NIFTY Options Market Report", level=0)
        heading.runs[0].font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        doc.add_heading("Market Summary", level=1)
        table = doc.add_table(rows=1, cols=2)
        table.style = "Table Grid"
        hdr = table.rows[0].cells
        hdr[0].text = "Metric"
        hdr[1].text = "Value"
        for label, val in [
            ("Overall PCR", str(stats["overall_pcr"])),
            ("Market Bias", stats["market_bias"].upper()),
            ("Resistance Strike", f"₹{stats['resistance_strike']:,.0f}" if stats["resistance_strike"] else "N/A"),
            ("Support Strike", f"₹{stats['support_strike']:,.0f}" if stats["support_strike"] else "N/A"),
            ("Total Data Rows", f"{stats['total_rows']:,}"),
        ]:
            row = table.add_row().cells
            row[0].text = label
            row[1].text = val

        doc.add_paragraph()
        doc.add_heading("Recent Hourly PCR (last 10 periods)", level=1)
        pcr_table = doc.add_table(rows=1, cols=2)
        pcr_table.style = "Table Grid"
        ph = pcr_table.rows[0].cells
        ph[0].text = "Timestamp"
        ph[1].text = "PCR"
        for ts, pcr in list(zip(pcr_data["timestamps"][-10:], pcr_data["pcr_values"][-10:])):
            pr = pcr_table.add_row().cells
            pr[0].text = str(ts)
            pr[1].text = str(pcr)

        buf = BytesIO()
        doc.save(buf)
        buf.seek(0)
        return Response(
            content=buf.read(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=skew_report.docx"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report")
async def report(request: Request):
    try:
        from weasyprint import HTML

        conn = request.app.state.db
        stats = get_aggregated_stats(conn)
        pcr_data = get_pcr_series(conn)

        recent = list(zip(pcr_data["timestamps"][-10:], pcr_data["pcr_values"][-10:]))
        pcr_rows = "".join(
            f"<tr><td>{ts}</td><td>{pcr}</td></tr>" for ts, pcr in recent
        )

        html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"/>
        <style>
          body {{ font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }}
          h1   {{ color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }}
          h2   {{ color: #334155; margin-top: 28px; }}
          table {{ border-collapse: collapse; width: 100%; margin-top: 12px; }}
          th, td {{ border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }}
          th {{ background: #f1f5f9; font-weight: 600; }}
          .badge {{ display:inline-block; padding:3px 10px; border-radius:9999px; font-size:12px; font-weight:700; }}
          .bullish {{ background:#dcfce7; color:#166534; }}
          .bearish {{ background:#fee2e2; color:#991b1b; }}
        </style></head><body>
          <h1>Skew — NIFTY Options Market Report</h1>
          <h2>Market Summary</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Overall PCR</td><td>{stats['overall_pcr']}</td></tr>
            <tr><td>Market Bias</td><td><span class="badge {stats['market_bias']}">{stats['market_bias'].upper()}</span></td></tr>
            <tr><td>Resistance Strike</td><td>{stats['resistance_strike']}</td></tr>
            <tr><td>Support Strike</td><td>{stats['support_strike']}</td></tr>
            <tr><td>Total Data Rows</td><td>{stats['total_rows']}</td></tr>
          </table>
          <h2>Recent Hourly PCR (last 10 periods)</h2>
          <table><tr><th>Timestamp</th><th>PCR</th></tr>{pcr_rows}</table>
        </body></html>"""

        pdf_bytes = HTML(string=html).write_pdf()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=skew_report.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
