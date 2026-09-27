from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/health-profile", tags=["health-profile"])


def _calc_bmi(height_cm, weight_kg):
    if not height_cm or not weight_kg:
        return None
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)


@router.get("", response_model=schemas.HealthProfileResponse)
def get_health_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.health_profile
    if not profile:
        profile = models.HealthProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("", response_model=schemas.HealthProfileResponse)
def update_health_profile(
    payload: schemas.HealthProfileRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.health_profile
    if not profile:
        profile = models.HealthProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    # Auto-calculate BMI whenever both height and weight are known
    height = profile.height_cm
    weight = profile.weight_kg
    profile.bmi = _calc_bmi(height, weight)

    db.commit()
    db.refresh(profile)

    # Track weight + bmi as trend metrics if provided
    if payload.weight_kg is not None:
        db.add(models.HealthMetric(user_id=current_user.id, metric_type="weight", value=payload.weight_kg, unit="kg", source="manual"))
    if profile.bmi is not None:
        db.add(models.HealthMetric(user_id=current_user.id, metric_type="bmi", value=profile.bmi, unit=None, source="manual"))
    if payload.blood_pressure_systolic is not None and payload.blood_pressure_diastolic is not None:
        db.add(models.HealthMetric(
            user_id=current_user.id, metric_type="blood_pressure",
            value=payload.blood_pressure_systolic, unit="mmHg (systolic)", source="manual",
        ))
    db.commit()

    return profile
