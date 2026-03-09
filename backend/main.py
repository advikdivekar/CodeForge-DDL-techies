import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.loader import init_db
from routes.data import router as data_router
from routes.charts import router as charts_router
from routes.ai import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = init_db()
    yield
    app.state.db.close()


app = FastAPI(title="Skew API", lifespan=lifespan)

_origins = [
    "http://localhost:3000",
    "http://frontend:3000",
    os.environ.get("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
async def ping():
    return {"status": "ok"}

app.include_router(data_router, prefix="/api/data")
app.include_router(charts_router, prefix="/api/charts")
app.include_router(ai_router, prefix="/api")
