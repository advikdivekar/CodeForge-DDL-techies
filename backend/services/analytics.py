import numpy as np
import duckdb
from pyod.models.hbos import HBOS
from pyod.models.iforest import IForest


def get_pcr_series(conn: duckdb.DuckDBPyConnection) -> dict:
    df = conn.execute("""
        SELECT
            date_trunc('hour', CAST(datetime AS TIMESTAMP))              AS hour,
            SUM(oi_PE) / NULLIF(SUM(CAST(oi_CE AS DOUBLE)), 0)          AS pcr
        FROM options
        GROUP BY hour
        ORDER BY hour
    """).fetchdf()

    timestamps = df["hour"].dt.strftime("%Y-%m-%dT%H:%M:%S").tolist()
    pcr_values = [round(v, 4) if v is not None and not np.isnan(v) else None
                  for v in df["pcr"].tolist()]

    signals = {}
    for ts, pcr in zip(timestamps, pcr_values):
        if pcr is None:
            signals[ts] = "neutral"
        elif pcr > 1.3:
            signals[ts] = "bearish"
        elif pcr < 0.7:
            signals[ts] = "bullish"
        else:
            signals[ts] = "neutral"

    return {"timestamps": timestamps, "pcr_values": pcr_values, "signals": signals}


def detect_volume_anomalies(conn: duckdb.DuckDBPyConnection) -> dict:
    df = conn.execute("""
        SELECT
            CAST(datetime AS VARCHAR) AS datetime,
            strike,
            total_volume,
            volume_CE,
            volume_PE
        FROM options
        WHERE total_volume IS NOT NULL
        ORDER BY datetime
    """).fetchdf()

    # log1p normalizes the extreme range (130 – 113M) before histogram binning
    X = np.log1p(df[["total_volume"]].values.astype(float))

    # HBOS is preferred; numpy 1.26.4 + Python 3.14 has a bincount bug that
    # breaks HBOS on some datasets, so fall back to IForest transparently.
    clf = None
    for n_bins in [40, 20, 50, 10]:
        try:
            clf = HBOS(contamination=0.05, n_bins=n_bins)
            clf.fit(X)
            break
        except (ValueError, RuntimeError):
            clf = None

    if clf is None:
        clf = IForest(contamination=0.05, random_state=42)
        clf.fit(X)

    df["anomaly"] = clf.labels_.tolist()          # 0 = normal, 1 = anomaly
    df["anomaly_score"] = clf.decision_scores_.tolist()

    records = df.to_dict(orient="records")
    total_anomalies = int(clf.labels_.sum())
    anomaly_rate = round(total_anomalies / len(df) * 100, 2) if len(df) > 0 else 0.0

    return {
        "data": records,
        "total_anomalies": total_anomalies,
        "anomaly_rate": anomaly_rate,
    }


def get_aggregated_stats(conn: duckdb.DuckDBPyConnection) -> dict:
    row = conn.execute("""
        SELECT
            SUM(oi_PE) / NULLIF(SUM(CAST(oi_CE AS DOUBLE)), 0) AS overall_pcr,
            COUNT(*)                                             AS total_rows
        FROM options
    """).fetchone()

    overall_pcr = round(row[0], 4) if row[0] is not None else 0.0
    total_rows = row[1]

    resistance = conn.execute("""
        SELECT strike
        FROM options
        GROUP BY strike
        ORDER BY SUM(oi_CE) DESC
        LIMIT 1
    """).fetchone()

    support = conn.execute("""
        SELECT strike
        FROM options
        GROUP BY strike
        ORDER BY SUM(oi_PE) DESC
        LIMIT 1
    """).fetchone()

    market_bias = "bearish" if overall_pcr > 1.0 else "bullish"

    return {
        "overall_pcr": overall_pcr,
        "market_bias": market_bias,
        "resistance_strike": float(resistance[0]) if resistance else None,
        "support_strike": float(support[0]) if support else None,
        "total_rows": total_rows,
    }


def get_pcr_interpretation(pcr_value: float) -> dict:
    pcr = round(pcr_value, 2)

    if pcr > 1.5:
        signal = "strongly_bearish"
        interpretation = (
            f"PCR at {pcr} — Extreme put loading, bearish sentiment overwhelmingly dominant. "
            "Heavy selling pressure expected; options market pricing in significant downside risk."
        )
    elif pcr > 1.3:
        signal = "bearish"
        interpretation = (
            f"PCR at {pcr} — Put writers dominant, market expects support to hold. "
            "Bearish lean with hedge covering; watch for bounce at key support strikes."
        )
    elif pcr > 1.1:
        signal = "mildly_bearish"
        interpretation = (
            f"PCR at {pcr} — Slight put bias. Traders positioning for mild downside "
            "or hedging existing long positions against near-term volatility."
        )
    elif pcr >= 0.9:
        signal = "neutral"
        interpretation = (
            f"PCR at {pcr} — Market balanced between calls and puts. "
            "No strong directional conviction; range-bound price action likely."
        )
    elif pcr >= 0.7:
        signal = "mildly_bullish"
        interpretation = (
            f"PCR at {pcr} — Call writers active, upside expectations building. "
            "Mild bullish tone; market anticipates gradual move higher."
        )
    elif pcr >= 0.5:
        signal = "bullish"
        interpretation = (
            f"PCR at {pcr} — Call dominance signals bullish sentiment. "
            "Market pricing in an upside breakout; momentum favours buyers."
        )
    else:
        signal = "strongly_bullish"
        interpretation = (
            f"PCR at {pcr} — Extreme call loading. Euphoric or speculative bullish "
            "positioning — elevated reversal risk if rally stalls."
        )

    return {"value": pcr, "signal": signal, "interpretation": interpretation}
