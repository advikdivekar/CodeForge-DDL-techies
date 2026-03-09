import os
from pathlib import Path

import duckdb
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")


def init_db() -> duckdb.DuckDBPyConnection:
    data_dir_env = os.environ.get("DATA_DIR", "../data")
    data_dir = Path(data_dir_env)
    if not data_dir.is_absolute():
        # Resolve relative to backend/ (parent of services/)
        data_dir = (Path(__file__).parent.parent / data_dir_env).resolve()

    csv_files = sorted(data_dir.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {data_dir}")

    conn = duckdb.connect(":memory:")

    parts = [f"SELECT * FROM read_csv_auto('{f.as_posix()}')" for f in csv_files]
    union_query = " UNION ALL ".join(parts)

    conn.execute(f"""
        CREATE TABLE options AS
        SELECT
            *,
            oi_PE / NULLIF(CAST(oi_CE AS DOUBLE), 0)               AS pcr,
            oi_CE + oi_PE                                           AS total_oi,
            volume_CE + volume_PE                                   AS total_volume,
            (CE + PE) / NULLIF(CAST(spot_close AS DOUBLE), 0) * 100 AS iv_proxy
        FROM ({union_query})
    """)

    return conn
