import os
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from sqlalchemy.exc import OperationalError

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vitalsignai")

from app.database import engine, Base
from app import models  # noqa: F401  (ensures models are registered before create_all)
from app.routers import auth, profile, assessment, health_profile, metrics, reports
from app.ml.predictor import get_metrics

app = FastAPI(title="VitalSignAI API", version="1.0.0")

# ---------- CORS ----------
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Global error handling (never leak stack traces) ----------
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on our end. Please try again."},
    )


# ---------- Startup: wait for MySQL, then create tables ----------
# Docker Compose's healthcheck already waits for MySQL to accept connections,
# but this retry loop is a second safety net (e.g. first-run local dev
# without Docker, or a slow MySQL init even after the healthcheck passes).
def _wait_for_database(max_attempts: int = 15, delay_seconds: float = 2.0):
    for attempt in range(1, max_attempts + 1):
        try:
            with engine.connect() as conn:
                conn.execute(__import__("sqlalchemy").text("SELECT 1"))
            logger.info("Database connection established (attempt %d).", attempt)
            return True
        except OperationalError as e:
            logger.warning("Database not ready yet (attempt %d/%d): %s", attempt, max_attempts, e)
            time.sleep(delay_seconds)
    return False


@app.on_event("startup")
def on_startup():
    if _wait_for_database():
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables verified/created successfully.")
        except Exception as e:
            logger.error("Could not initialize database tables: %s", e)
    else:
        logger.error(
            "Could not connect to MySQL after multiple attempts. Check DATABASE_URL "
            "and that the MySQL container/service is running."
        )


# ---------- Routers ----------
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(health_profile.router)
app.include_router(assessment.router)
app.include_router(metrics.router)
app.include_router(reports.router)


# ---------- Health & ML info ----------
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "VitalSignAI API"}


@app.get("/api/ml/info")
def ml_info():
    metrics_data = get_metrics()
    return {
        "algorithm": "Logistic Regression",
        "library": "scikit-learn",
        "features": metrics_data.get("features", []),
        "metrics": {
            "accuracy": metrics_data.get("accuracy"),
            "precision": metrics_data.get("precision"),
            "recall": metrics_data.get("recall"),
            "f1_score": metrics_data.get("f1_score"),
        },
        "note": "Metrics computed on a held-out test set during training. Not a medical diagnosis.",
    }
