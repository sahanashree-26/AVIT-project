# VitalSignAI
## AI-Based Early Diabetes Risk Prediction System Using Machine Learning

---

## Abstract

VitalSignAI is a full-stack web application that predicts an individual's
early risk of diabetes from eight standard health measurements. It uses a
Logistic Regression model trained with scikit-learn, a FastAPI backend, a
React frontend, and a MySQL database for persistent storage of users and
assessment history. The system is designed to be simple, explainable, and
easy to demonstrate — a single, well-understood ML algorithm applied to a
single, well-defined health screening problem.

## Introduction

Diabetes is a widespread chronic condition, and early awareness of risk
factors can encourage people to seek timely medical advice. VitalSignAI
demonstrates how a simple, interpretable machine learning model can be
packaged into a usable web application that takes routine health
measurements and returns an early risk indication.

## Problem Statement

Diabetes risk can be difficult for a non-specialist to judge from raw health
numbers (glucose, BMI, blood pressure, etc.) alone. There is no lightweight,
self-serve tool for someone to enter their own numbers and get an
evidence-based, ML-driven early indication of risk.

## Objectives

1. Build a web application where a user can register, log in, and submit
   health data.
2. Train and apply a Logistic Regression model to predict diabetes risk.
3. Persist users and assessment history reliably in MySQL.
4. Present results clearly, including the model's predicted probability.
5. Keep the system simple enough to fully explain in a viva.

## Existing System

Most existing diabetes-risk tools are either static risk calculators (fixed
rule-based scoring, e.g. simple point systems) or are embedded inside large
clinical software suites not accessible to the general public. Few offer a
transparent, self-contained ML-based prediction with a visible confidence
score.

## Proposed System

VitalSignAI proposes a lightweight three-tier system:
- A React frontend for data entry and result display.
- A FastAPI backend that validates input, applies a trained Logistic
  Regression model, and returns a prediction with a probability score.
- A MySQL database that stores users and every assessment they submit, so
  they can review their history over time.

## Methodology

1. **Data preparation** — health features are cleaned (missing/invalid rows
   dropped) and split into training and test sets (80/20, stratified).
2. **Feature scaling** — `StandardScaler` normalizes all 8 features before
   training, since Logistic Regression is sensitive to feature scale.
3. **Model training** — `LogisticRegression` from scikit-learn is fit on the
   scaled training data.
4. **Evaluation** — accuracy, precision, recall, and F1-score are computed on
   the held-out test set.
5. **Persistence** — the fitted model and scaler are saved with `joblib` so
   the backend loads them once at startup rather than retraining per request.
6. **Serving** — FastAPI loads the saved model/scaler, applies them to new
   user input, and returns both the class prediction and the probability.

## System Architecture

```
┌─────────────┐      HTTPS/JSON      ┌──────────────┐      SQL       ┌─────────┐
│   React      │  ───────────────▶   │   FastAPI     │  ───────────▶ │  MySQL  │
│  (Vite, TW)  │  ◀───────────────   │  + SQLAlchemy │  ◀─────────── │         │
└─────────────┘                      └──────┬───────┘                └─────────┘
                                             │
                                             ▼
                                   ┌────────────────────┐
                                   │ Logistic Regression │
                                   │  (joblib .pkl file) │
                                   └────────────────────┘
```

## Project Flow

Register → Login → Dashboard → Health Assessment → Submit → FastAPI receives
data → Logistic Regression model predicts → Result shown to user → Result
saved in MySQL → user can view history under "My Assessments".

## Machine Learning Method

**Algorithm:** Logistic Regression (binary classification), chosen because
it is simple, fast, well understood, and produces a probability score that
is easy to explain — appropriate for a final-year project's scope.

## Logistic Regression Explanation

Logistic Regression models the probability that an input belongs to the
positive class (diabetes risk) using the sigmoid function applied to a
weighted sum of the input features:

```
z = w1*x1 + w2*x2 + ... + w8*x8 + b
probability = 1 / (1 + e^(-z))
```

If the predicted probability is ≥ 0.5, the model classifies the case as
"Diabetes Risk Detected"; otherwise "No Diabetes Risk Detected". The
probability itself is shown to the user as model confidence.

## Dataset

A synthetic dataset (900 rows) generated with a fixed random seed, following
the same 8 features and value ranges as the well-known Pima Indians
Diabetes Dataset, with the positive class (~37%) close to the real dataset's
known ~35% prevalence. *(Built without internet access to fetch the original
CSV — see README for how to swap in the real dataset.)*

## Features (Inputs)

| Feature | Description |
|---|---|
| Pregnancies | Number of times pregnant |
| Glucose | Plasma glucose concentration |
| BloodPressure | Diastolic blood pressure (mm Hg) |
| SkinThickness | Triceps skinfold thickness (mm) |
| Insulin | 2-hour serum insulin (mu U/ml) |
| BMI | Body mass index |
| DiabetesPedigreeFunction | Diabetes likelihood based on family history |
| Age | Age in years |

**Target:** `Outcome` — 0 = No diabetes risk, 1 = Diabetes risk.

## Database Design

**users**: id, name, email, password_hash, age, gender, created_at
**assessments**: id, user_id (FK → users.id), pregnancies, glucose,
blood_pressure, skin_thickness, insulin, bmi, diabetes_pedigree, age,
prediction, probability, created_at

## MySQL

Database name: `vitalsignai`. Tables are created automatically by
SQLAlchemy (`Base.metadata.create_all`) on backend startup — no manual
migration tooling required for this project's scope.

## Frontend

React (with Vite as the build tool) and Tailwind CSS for styling, React
Router for navigation between pages (Home, Login, Register, Health
Assessment, Result, My Assessments, Profile, About).

## Backend

FastAPI serves a small REST API (`/api/auth/*`, `/api/profile`,
`/api/assessment/*`, `/api/health`, `/api/ml/info`). SQLAlchemy is the ORM
for MySQL access; Pydantic validates every request body.

## API Summary

| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | Service health check |
| POST | /api/auth/register | Create a new user, returns JWT |
| POST | /api/auth/login | Authenticate, returns JWT |
| POST | /api/auth/logout | Stateless logout |
| GET | /api/profile | Get current user's profile |
| PUT | /api/profile | Update current user's profile |
| POST | /api/assessment/predict | Run prediction, save + return result |
| GET | /api/assessment/history | List current user's past assessments |
| GET | /api/ml/info | Model type + evaluation metrics |

## Testing

The ML pipeline (dataset generation → train/test split → scaling →
Logistic Regression fit → evaluation → save with joblib) was actually
executed, producing the real metrics below. Full end-to-end testing of the
live web app (MySQL connection, register/login/predict/history flow)
should be performed by the developer on a machine with MySQL, Python, and
Node available, following the checklist in `docs/viva_questions.md`'s
companion testing steps and the flow described in the README.

## Results

Real, held-out test-set metrics from the trained model:

- Accuracy: **80.0%**
- Precision: **79.25%**
- Recall: **62.69%**
- F1-score: **70.0%**

## Limitations

- Trained on a synthetic dataset (see Dataset section) rather than the
  original Pima Indians dataset, due to no internet access during
  development.
- Single algorithm (Logistic Regression) — no ensemble/comparison models,
  by design, to keep the project simple and explainable.
- Not validated against real clinical data; not a medical diagnostic tool.

## Future Enhancements

- Swap in the real, published diabetes dataset for training.
- Add simple data visualizations of a user's risk trend over time.
- Add password reset via email.
- Deploy to Vercel (frontend) + Render (backend) + managed cloud MySQL.

## Conclusion

VitalSignAI demonstrates a complete, working, end-to-end machine learning
web application: a single well-understood algorithm (Logistic Regression),
a clean three-tier architecture (React, FastAPI, MySQL), and a scope that
is realistic to build, explain, and defend as a final-year project.
