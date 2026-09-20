"""AttritionIQ API - FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db
from .model import get_model
from .routers import auth, predict

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    get_model()  # warm the model into memory
    yield


app = FastAPI(
    title="AttritionIQ API",
    description="Explainable employee-attrition prediction.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(predict.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "attritioniq-api"}
