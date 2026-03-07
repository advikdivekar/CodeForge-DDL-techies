# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Skew** — AI-powered NIFTY options analytics platform (CodeForge FinTech Challenge). Processes options market CSVs, exposes analytics via a FastAPI backend, and visualizes results in a Next.js frontend with Plotly charts.

## Architecture

```
CodeForge-DDL-techies/
├── backend/
│   ├── main.py                  # FastAPI app, lifespan, CORS, router includes
│   ├── services/
│   │   ├── loader.py            # DuckDB :memory: loads all CSVs, derives columns
│   │   ├── analytics.py         # get_pcr_series, detect_volume_anomalies, get_aggregated_stats
│   │   └── ai.py                # ask_gemini (Gemini 2.0 Flash), ask_groq (Llama 3.3 70B)
│   ├── routes/
│   │   ├── data.py              # GET /api/data/summary
│   │   ├── charts.py            # GET /api/charts/{oi-heatmap,pcr,volume-spikes,volatility-surface}
│   │   └── ai.py                # POST /api/query, GET /api/narrative, POST /api/aria, GET /api/report
│   ├── requirements.txt
│   └── venv/                    # Python 3.14 venv
├── frontend/                    # Next.js 16, React 19, TypeScript, Tailwind v4
│   └── app/                     # Next.js App Router
└── data/                        # 3 options CSVs (weekly snapshots, ~147k rows total)
```

**CSV columns**: `symbol, datetime, expiry, CE, PE, spot_close, ATM, strike, oi_CE, oi_PE, volume_CE, volume_PE`

**Derived columns** (added at load): `pcr = oi_PE/oi_CE`, `total_oi`, `total_volume`, `iv_proxy = (CE+PE)/spot_close*100`

## Commands

### Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Environment

**`backend/.env`** (already present):
```
GEMINI_API_KEY=...
GROQ_API_KEY=...
DATA_DIR=../data
HOST=0.0.0.0
PORT=8000
```

**`frontend/.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Key Implementation Details

**DB loading** (`services/loader.py`): DuckDB `:memory:`, UNION ALL across all `*.csv` in `DATA_DIR`, resolved relative to `backend/`. Connection stored in `app.state.db` at startup via lifespan.

**Anomaly detection** (`services/analytics.py`): Uses PyOD HBOS with `log1p`-transformed volume. **numpy 1.26.4 + Python 3.14 has a bincount bug** that breaks HBOS — code retries with multiple `n_bins` values, then falls back to `IForest(contamination=0.05)` automatically.

**AI models**: Gemini `gemini-2.0-flash` (was `gemini-2.0-flash-exp` per spec, but that model name doesn't exist). Groq `llama-3.3-70b-versatile`. groq pinned to `>=0.13.0` because groq `0.11.0` passes `proxies=` to httpx 0.28 which removed it.

**PCR signals**: PCR > 1.3 → bearish, PCR < 0.7 → bullish, else neutral. Market resistance = strike with max `SUM(oi_CE)`, support = max `SUM(oi_PE)`.

**CORS**: Only `http://localhost:3000` is allowed.

## Frontend Stack

Next.js App Router (pages in `frontend/app/`), Tailwind CSS v4 (PostCSS-based), shadcn (`npx shadcn add <component>`), `react-plotly.js` for charts, `axios` for API calls, `lucide-react` for icons.
