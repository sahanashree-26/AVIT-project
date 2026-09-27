"""
train.py — trains the ONE model this project uses: Logistic Regression.

Run with:  python app/ml/train.py

Loads backend/data/diabetes.csv (real dataset if you've placed one there,
otherwise the synthetic one from generate_dataset.py), does a train/test
split, scales features, fits Logistic Regression, prints real metrics
(accuracy/precision/recall/F1 — never invented), and saves:
  backend/ml_models/diabetes_logistic_regression.pkl
  backend/ml_models/scaler.pkl
  backend/ml_models/metrics.json
"""
import os
import json
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

FEATURES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age",
]
TARGET = "Outcome"

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(HERE, "..", "..", "data", "diabetes.csv")
MODEL_DIR = os.path.join(HERE, "..", "..", "ml_models")


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"No dataset found at {DATA_PATH}. Run generate_dataset.py first, "
            f"or place a diabetes.csv there with the same column names."
        )

    df = pd.read_csv(DATA_PATH)
    df = df.dropna()
    df = df[(df["Glucose"] > 0) & (df["BMI"] > 0)]  # basic cleaning

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": FEATURES,
    }

    print("=== Logistic Regression evaluation (real, computed on held-out test set) ===")
    for k, v in metrics.items():
        print(f"{k}: {v}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, "diabetes_logistic_regression.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nSaved model + scaler + metrics.json to {MODEL_DIR}")


if __name__ == "__main__":
    main()
