import os
import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

UPLOAD_DIR = os.getenv("REPORT_UPLOAD_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _sanitize_filename(filename: str) -> str:
    base = os.path.basename(filename)
    base = re.sub(r"[^A-Za-z0-9._-]", "_", base)
    return base[:180] or "report"


@router.post("/upload", response_model=schemas.ReportResponse, status_code=201)
async def upload_report(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, and PNG files are supported.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File is too large. Maximum size is 10 MB.")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    file_type = ALLOWED_TYPES[file.content_type]
    safe_original_name = _sanitize_filename(file.filename or f"report.{file_type}")
    stored_filename = f"{current_user.id}_{uuid.uuid4().hex}.{file_type}"
    stored_path = os.path.join(UPLOAD_DIR, stored_filename)

    with open(stored_path, "wb") as f:
        f.write(contents)

    report = models.Report(
        user_id=current_user.id,
        filename=safe_original_name,
        stored_filename=stored_filename,
        file_type=file_type,
        file_size_bytes=len(contents),
        status="awaiting_review",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=list[schemas.ReportResponse])
def list_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Report)
        .filter(models.Report.user_id == current_user.id)
        .order_by(desc(models.Report.uploaded_at))
        .all()
    )


@router.get("/{report_id}", response_model=schemas.ReportResponse)
def get_report(
    report_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(models.Report)
        .filter(models.Report.id == report_id, models.Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report


@router.post("/{report_id}/metrics", response_model=schemas.ReportResponse, status_code=201)
def add_report_metric(
    report_id: int,
    payload: schemas.ReportMetricRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Manually record a value the user read from their own uploaded report.
    NOTE: automatic OCR/extraction is not implemented in this build — values
    are entered by the user themselves so nothing shown is ever fabricated.
    """
    report = (
        db.query(models.Report)
        .filter(models.Report.id == report_id, models.Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    metric = models.ReportMetric(
        report_id=report.id,
        metric_name=payload.metric_name.strip(),
        value=payload.value,
        unit=payload.unit,
        reference_range=payload.reference_range,
        entry_method="manual",
    )
    db.add(metric)
    report.status = "reviewed"

    # Mirror glucose/weight/bmi entries into the trend-tracking table too
    name_lower = payload.metric_name.strip().lower()
    metric_type_map = {"glucose": "glucose", "weight": "weight", "bmi": "bmi"}
    if name_lower in metric_type_map:
        db.add(models.HealthMetric(
            user_id=current_user.id, metric_type=metric_type_map[name_lower],
            value=payload.value, unit=payload.unit, source="report",
        ))

    db.commit()
    db.refresh(report)
    return report


@router.get("/compare/latest-two")
def compare_latest_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(models.Report)
        .filter(models.Report.user_id == current_user.id)
        .order_by(desc(models.Report.uploaded_at))
        .limit(2)
        .all()
    )
    if len(reports) < 2:
        return {"comparable": False, "message": "Upload at least two reviewed reports to compare."}

    latest, previous = reports[0], reports[1]
    latest_metrics = {m.metric_name: m for m in latest.metrics}
    previous_metrics = {m.metric_name: m for m in previous.metrics}

    comparisons = []
    for name in set(latest_metrics) & set(previous_metrics):
        prev_val = previous_metrics[name].value
        curr_val = latest_metrics[name].value
        comparisons.append({
            "metric_name": name,
            "previous": prev_val,
            "latest": curr_val,
            "change": round(curr_val - prev_val, 2),
            "unit": latest_metrics[name].unit,
        })

    return {
        "comparable": True,
        "previous_report_date": previous.uploaded_at,
        "latest_report_date": latest.uploaded_at,
        "comparisons": comparisons,
    }
