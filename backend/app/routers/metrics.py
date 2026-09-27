from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc

from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.post("", response_model=schemas.HealthMetricResponse, status_code=201)
def add_metric(
    payload: schemas.HealthMetricRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    metric = models.HealthMetric(
        user_id=current_user.id,
        metric_type=payload.metric_type,
        value=payload.value,
        unit=payload.unit,
        source="manual",
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


@router.get("", response_model=list[schemas.HealthMetricResponse])
def list_metrics(
    metric_type: str | None = Query(default=None, pattern="^(glucose|weight|bmi|blood_pressure)$"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.HealthMetric).filter(models.HealthMetric.user_id == current_user.id)
    if metric_type:
        query = query.filter(models.HealthMetric.metric_type == metric_type)
    return query.order_by(asc(models.HealthMetric.recorded_at)).all()
