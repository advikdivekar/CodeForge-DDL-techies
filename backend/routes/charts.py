from fastapi import APIRouter, HTTPException, Request

from services.analytics import get_pcr_series, detect_volume_anomalies

router = APIRouter()


@router.get("/oi-heatmap")
async def oi_heatmap(request: Request):
    try:
        conn = request.app.state.db

        df = conn.execute("""
            SELECT
                strike,
                date_trunc('hour', CAST(datetime AS TIMESTAMP)) AS hour,
                SUM(total_oi)                                   AS total_oi
            FROM options
            WHERE total_oi IS NOT NULL
            GROUP BY strike, hour
            ORDER BY strike, hour
        """).fetchdf()

        df = df.assign(hour_str=df["hour"].dt.strftime("%Y-%m-%dT%H:%M:%S"))

        pivot = df.pivot_table(
            index="strike",
            columns="hour_str",
            values="total_oi",
            fill_value=0,
        )

        strikes = [float(s) for s in pivot.index.tolist()]
        timestamps = pivot.columns.tolist()
        values = [[int(v) for v in row] for row in pivot.values.tolist()]

        return {"strikes": strikes, "timestamps": timestamps, "values": values}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pcr")
async def pcr_chart(request: Request):
    try:
        conn = request.app.state.db
        return get_pcr_series(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/volume-spikes")
async def volume_spikes(request: Request):
    try:
        conn = request.app.state.db
        return detect_volume_anomalies(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/volatility-surface")
async def volatility_surface(request: Request):
    try:
        conn = request.app.state.db

        df = conn.execute("""
            SELECT
                strike,
                CAST(expiry AS VARCHAR) AS expiry,
                AVG(iv_proxy)           AS avg_iv
            FROM options
            WHERE iv_proxy IS NOT NULL
            GROUP BY strike, expiry
            ORDER BY expiry, strike
        """).fetchdf()

        pivot = df.pivot_table(
            index="expiry",
            columns="strike",
            values="avg_iv",
            fill_value=0,
        )

        strikes = [float(s) for s in pivot.columns.tolist()]
        expiries = pivot.index.tolist()
        surface = [[round(v, 4) for v in row] for row in pivot.values.tolist()]

        return {"strikes": strikes, "expiries": expiries, "surface": surface}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/volatility-skew")
async def volatility_skew(request: Request):
    try:
        conn = request.app.state.db

        df = conn.execute("""
            SELECT
                CAST(expiry AS VARCHAR) AS expiry,
                strike,
                AVG(iv_proxy)           AS avg_iv
            FROM options
            WHERE iv_proxy IS NOT NULL
            GROUP BY expiry, strike
            ORDER BY expiry, strike
        """).fetchdf()

        expiries = sorted(df["expiry"].unique().tolist())
        strikes = sorted(df["strike"].unique().tolist())

        # One list of IV values per expiry, aligned to the full strikes axis
        lines: dict[str, list] = {}
        for expiry in expiries:
            exp_df = df[df["expiry"] == expiry].set_index("strike")
            lines[expiry] = [
                round(float(exp_df.loc[s, "avg_iv"]), 4) if s in exp_df.index else None
                for s in strikes
            ]

        return {
            "expiries": expiries,
            "strikes": [float(s) for s in strikes],
            "lines": lines,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/max-pain")
async def max_pain(request: Request):
    try:
        conn = request.app.state.db

        df = conn.execute("""
            SELECT
                strike,
                SUM(oi_CE) AS total_oi_CE,
                SUM(oi_PE) AS total_oi_PE
            FROM options
            GROUP BY strike
            ORDER BY strike
        """).fetchdf()

        strikes = df["strike"].tolist()
        oi_ce = df["total_oi_CE"].fillna(0).tolist()
        oi_pe = df["total_oi_PE"].fillna(0).tolist()

        # For each potential expiry price K, compute total writer pain:
        #   CE pain: SUM(max(0, K - S) * oi_CE(S))  — ITM calls writers must pay
        #   PE pain: SUM(max(0, S - K) * oi_PE(S))  — ITM puts writers must pay
        # Max pain strike = K that minimises total writer payout (= max buyer loss)
        pain_values = []
        for k in strikes:
            ce_pain = sum(max(0.0, k - s) * oi_ce[j] for j, s in enumerate(strikes))
            pe_pain = sum(max(0.0, s - k) * oi_pe[j] for j, s in enumerate(strikes))
            pain_values.append(ce_pain + pe_pain)

        min_idx = pain_values.index(min(pain_values))
        max_pain_strike = float(strikes[min_idx])

        return {
            "strikes": [float(s) for s in strikes],
            "pain_values": [round(v, 2) for v in pain_values],
            "max_pain_strike": max_pain_strike,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/oi-change")
async def oi_change(request: Request):
    try:
        conn = request.app.state.db

        # Compare latest vs previous distinct timestamp, aggregated per strike
        df = conn.execute("""
            WITH ranked AS (
                SELECT
                    strike,
                    oi_CE,
                    oi_PE,
                    CAST(datetime AS TIMESTAMP)                              AS ts,
                    DENSE_RANK() OVER (ORDER BY CAST(datetime AS TIMESTAMP) DESC) AS rk
                FROM options
            ),
            latest AS (
                SELECT strike, SUM(oi_CE) AS oi_CE, SUM(oi_PE) AS oi_PE
                FROM ranked WHERE rk = 1
                GROUP BY strike
            ),
            prev AS (
                SELECT strike, SUM(oi_CE) AS oi_CE, SUM(oi_PE) AS oi_PE
                FROM ranked WHERE rk = 2
                GROUP BY strike
            )
            SELECT
                l.strike,
                l.oi_CE - p.oi_CE AS ce_change,
                l.oi_PE - p.oi_PE AS pe_change
            FROM latest l
            JOIN prev p ON l.strike = p.strike
            ORDER BY l.strike
        """).fetchdf()

        strikes = [float(s) for s in df["strike"].tolist()]
        ce_change = [int(v) for v in df["ce_change"].fillna(0).tolist()]
        pe_change = [int(v) for v in df["pe_change"].fillna(0).tolist()]

        labels = []
        for ce, pe in zip(ce_change, pe_change):
            total = ce + pe
            labels.append("buildup" if total > 0 else "unwinding")

        return {
            "strikes": strikes,
            "ce_change": ce_change,
            "pe_change": pe_change,
            "labels": labels,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/oi-distribution")
async def oi_distribution(request: Request):
    try:
        conn = request.app.state.db

        df = conn.execute("""
            SELECT
                strike,
                SUM(oi_CE) AS oi_ce,
                SUM(oi_PE) AS oi_pe
            FROM options
            GROUP BY strike
            ORDER BY strike
        """).fetchdf()

        return {
            "strikes": [float(s) for s in df["strike"].tolist()],
            "oi_ce": [int(v) for v in df["oi_ce"].fillna(0).tolist()],
            "oi_pe": [int(v) for v in df["oi_pe"].fillna(0).tolist()],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
