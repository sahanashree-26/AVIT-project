"""
predictor.py — loads the already-trained model + scaler ONCE and exposes
predict_diabetes_risk(). The model is never retrained here.

Also exposes a REAL explainability function: for Logistic Regression,
each feature's contribution to the decision is coefficient * scaled_value.
This is the actual mathematical contribution the model used — nothing here
is invented or approximated by another technique.
"""
import os
import json
import joblib
import numpy as np

FEATURES = [
    "pregnancies", "glucose", "blood_pressure", "skin_thickness",
    "insulin", "bmi", "diabetes_pedigree", "age",
]

FEATURE_LABELS = {
    "pregnancies": "Pregnancies",
    "glucose": "Glucose",
    "blood_pressure": "Blood Pressure",
    "skin_thickness": "Skin Thickness",
    "insulin": "Insulin",
    "bmi": "BMI",
    "diabetes_pedigree": "Diabetes Pedigree (family history factor)",
    "age": "Age",
}

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(HERE, "..", "..", "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "diabetes_logistic_regression.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

_model = None
_scaler = None
_metrics = None


def _load():
    global _model, _scaler, _metrics
    if _model is None or _scaler is None:
        if not (os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH)):
            raise RuntimeError(
                "Trained model not found. Run: python app/ml/train.py "
                "(from the backend/ directory) before starting the API."
            )
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH) as f:
                _metrics = json.load(f)
    return _model, _scaler


def get_metrics():
    _load()
    return _metrics or {}


def _scaled_vector(payload: dict):
    model, scaler = _load()
    ordered = [payload[f] for f in FEATURES]
    X = np.array(ordered, dtype=float).reshape(1, -1)
    X_scaled = scaler.transform(X)
    return model, X_scaled


def predict_diabetes_risk(payload: dict):
    """
    Returns (prediction: int 0/1, probability: float 0-1)
    """
    model, X_scaled = _scaled_vector(payload)
    prediction = int(model.predict(X_scaled)[0])
    probability = float(model.predict_proba(X_scaled)[0][1])  # P(class=1)
    return prediction, round(probability, 4)


def explain_prediction(payload: dict, top_n: int = 8):
    """
    Real, computed explanation: for each feature, contribution = coef * scaled_value.
    Positive contribution pushes the prediction toward "risk"; negative pushes
    toward "no risk". This is exactly what Logistic Regression uses internally
    to form its decision (z = sum(coef_i * x_i) + intercept), so nothing here
    is fabricated or approximated.

    Returns a dict: {
      "risk_factors": [{feature, value, contribution}, ...]  (positive, sorted desc),
      "protective_factors": [{feature, value, contribution}, ...] (negative, sorted asc)
    }
    """
    model, X_scaled = _scaled_vector(payload)
    coefs = model.coef_[0]
    scaled_values = X_scaled[0]

    contributions = []
    for i, feature in enumerate(FEATURES):
        contribution = float(coefs[i] * scaled_values[i])
        contributions.append({
            "feature": FEATURE_LABELS[feature],
            "value": payload[feature],
            "contribution": round(contribution, 4),
        })

    risk_factors = sorted([c for c in contributions if c["contribution"] > 0],
                           key=lambda c: c["contribution"], reverse=True)[:top_n]
    protective_factors = sorted([c for c in contributions if c["contribution"] < 0],
                                 key=lambda c: c["contribution"])[:top_n]

    return {"risk_factors": risk_factors, "protective_factors": protective_factors}
