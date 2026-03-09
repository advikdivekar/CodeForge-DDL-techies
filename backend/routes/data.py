import os
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

router = APIRouter()


@router.get("/summary")
async def get_summary(request: Request):
    try:
        conn = request.app.state.db

        row = conn.execute("""
            SELECT
                COUNT(*)                                    AS total_rows,
                MIN(CAST(datetime AS TIMESTAMP))            AS start_date,
                MAX(CAST(datetime AS TIMESTAMP))            AS end_date,
                COUNT(DISTINCT strike)                      AS unique_strikes,
                COUNT(DISTINCT expiry)                      AS unique_expiries
            FROM options
        """).fetchone()

        null_row = conn.execute("""
            SELECT
                SUM(CASE WHEN oi_CE     IS NULL THEN 1 ELSE 0 END),
                SUM(CASE WHEN oi_PE     IS NULL THEN 1 ELSE 0 END),
                SUM(CASE WHEN volume_CE IS NULL THEN 1 ELSE 0 END),
                SUM(CASE WHEN volume_PE IS NULL THEN 1 ELSE 0 END),
                SUM(CASE WHEN spot_close IS NULL THEN 1 ELSE 0 END)
            FROM options
        """).fetchone()

        data_dir_env = os.environ.get("DATA_DIR", "../data")
        data_dir = Path(data_dir_env)
        if not data_dir.is_absolute():
            data_dir = (Path(__file__).parent.parent / data_dir_env).resolve()
        files_loaded = [f.name for f in sorted(data_dir.glob("*.csv"))]

        return {
            "total_rows": row[0],
            "date_range": {
                "start": str(row[1]),
                "end": str(row[2]),
            },
            "unique_strikes": row[3],
            "unique_expiries": row[4],
            "null_counts": {
                "oi_CE": null_row[0],
                "oi_PE": null_row[1],
                "volume_CE": null_row[2],
                "volume_PE": null_row[3],
                "spot_close": null_row[4],
            },
            "files_loaded": files_loaded,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
