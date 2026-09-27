import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user
from app.ml.predictor import predict_diabetes_risk, explain_prediction

router = APIRouter(prefix="/api/assessment", tags=["assessment"])

RISK_THRESHOLD = 0.5


def _to_feature_dict(payload: schemas.AssessmentRequest) -> dict:
    return {
        "pregnancies": payload.pregnancies,
        "glucose": payload.glucose,
        "blood_pressure": payload.blood_pressure,
        "skin_thickness": payload.skin_thickness,
        "insulin": payload.insulin,
        "bmi": payload.bmi,
        "diabetes_pedigree": payload.diabetes_pedigree,
        "age": payload.age,
    }


@router.post("/predict", response_model=schemas.AssessmentDetailResponse)
def predict(
    payload: schemas.AssessmentRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    features = _to_feature_dict(payload)
    try:
        prediction_int, probability = predict_diabetes_risk(features)
        explanation = explain_prediction(features)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to complete the assessment. Please try again.")

    prediction_label = "Diabetes Risk Detected" if prediction_int == 1 else "No Diabetes Risk Detected"
    risk_category = "Higher Risk" if probability >= RISK_THRESHOLD else "Lower Risk"

    assessment = models.Assessment(
        user_id=current_user.id,
        pregnancies=payload.pregnancies,
        glucose=payload.glucose,
        blood_pressure=payload.blood_pressure,
        skin_thickness=payload.skin_thickness,
        insulin=payload.insulin,
        bmi=payload.bmi,
        diabetes_pedigree=payload.diabetes_pedigree,
        age=payload.age,
        prediction=prediction_label,
        risk_category=risk_category,
        probability=probability,
        explanation_json=json.dumps(explanation),
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Track glucose + BMI as trend metrics too, sourced from this assessment
    db.add(models.HealthMetric(user_id=current_user.id, metric_type="glucose", value=payload.glucose, unit="mg/dL", source="assessment"))
    db.add(models.HealthMetric(user_id=current_user.id, metric_type="bmi", value=payload.bmi, unit=None, source="assessment"))
    db.commit()

    response = schemas.AssessmentDetailResponse.model_validate(assessment)
    response.explanation = schemas.ExplanationResponse(**explanation)
    return response


@router.get("/history", response_model=list[schemas.AssessmentResponse])
def history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(desc(models.Assessment.created_at))
        .all()
    )


@router.get("/{assessment_id}", response_model=schemas.AssessmentDetailResponse)
def get_assessment(
    assessment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.id == assessment_id, models.Assessment.user_id == current_user.id)
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    response = schemas.AssessmentDetailResponse.model_validate(assessment)
    if assessment.explanation_json:
        response.explanation = schemas.ExplanationResponse(**json.loads(assessment.explanation_json))
    return response
