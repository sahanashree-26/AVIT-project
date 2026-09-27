# VitalSignAI

**An intelligent preventive diabetes health companion.**
Guided health assessment → explainable ML risk prediction → report tracking →
preventive insights — built on React, FastAPI, MySQL, and a real trained
Logistic Regression model.

---

## Requirements

**Docker Desktop** — that's it. You do not need to separately install
Python, Node.js, or MySQL; everything runs inside containers.

## Run

```
git clone https://github.com/sahanashree-26/VitalSignai
cd VitalSignai
docker compose up --build
```

First build takes a few minutes (installs backend/frontend dependencies and
trains the ML model inside the image). MySQL has a healthcheck, and the
backend also retries its DB connection on startup, so `docker compose up
--build` works reliably from a clean machine — the backend won't crash-loop
if MySQL takes a few extra seconds to become ready.

## Open

http://localhost:3000

(API docs / Swagger, if you want them: http://localhost:8000/docs)

## Stop

```
docker compose down
```

To also wipe the database and start completely fresh:
```
docker compose down -v
```

## First Use

Register a new account, then complete your Health Profile and your first
Health Assessment.

Docker uses its **own local MySQL container** — it does not depend on any
external/cloud database. All data (users, assessments, health profiles,
reports) lives in the `mysql_data` Docker volume and persists across
restarts (but is removed by `docker compose down -v`).

---

## What's inside

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + React Router, served by nginx |
| Backend | Python + FastAPI + SQLAlchemy |
| ML | scikit-learn Logistic Regression (the only model/disease this app predicts: **diabetes**) |
| Database | MySQL (its own container in Docker; SQLAlchemy manages the schema) |

### Real trained-model metrics (held-out test set)
```
accuracy:  0.80
precision: 0.7925
recall:    0.6269
f1_score:  0.70
```
These are actual computed metrics from `backend/app/ml/train.py`, not invented numbers.

### Dataset note
This build's training data is a synthetic dataset with the same 8 features
and realistic clinical relationships as the well-known Pima Indians Diabetes
Dataset (generated without internet access to the original CSV). See
`backend/app/ml/generate_dataset.py`. To use the real dataset instead, drop
`diabetes.csv` into `backend/data/` with the same column names and rebuild
(`docker compose build backend`).

### Report upload — how it actually works
There is no OCR/text-extraction engine bundled in this build. Uploading a
PDF/JPG/PNG stores the file and lets you **manually enter** the values you
see on it (Glucose, HbA1c, BMI, etc.), which are then saved, shown back to
you, and used for comparisons across reports. This is a deliberate, honest
choice — the app never fabricates or guesses extracted values.

### Explainable predictions
Each prediction shows *why*: for Logistic Regression, a feature's
contribution to the result is `coefficient × scaled value` — exactly what
the model itself computes internally. Nothing is approximated or invented.

### Database schema
`users`, `health_profiles`, `assessments` (with a stored explanation),
`health_metrics` (trend tracking), `reports`, `report_metrics`. Tables are
created automatically on backend startup — no manual migration step.

## Project structure

```
VitalSignai/
├── backend/
│   ├── app/
│   │   ├── main.py, database.py, models.py, schemas.py, auth_utils.py
│   │   ├── routers/   auth.py, profile.py, health_profile.py, assessment.py, metrics.py, reports.py
│   │   └── ml/         generate_dataset.py, train.py, predictor.py (predict + explain)
│   ├── ml_models/      trained model + scaler + metrics.json
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/{pages,components,services,utils}
│   ├── Dockerfile
│   └── nginx.conf
├── database/create_database.sql
├── docs/                project write-up, presentation content, viva prep
└── docker-compose.yml
```

## Local development without Docker (optional)

If you'd rather run things directly:
```
# Backend
cd backend
python -m venv venv && source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env          # set your local MySQL password in DATABASE_URL
python app/ml/generate_dataset.py && python app/ml/train.py
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```
`setup.bat` / `run.bat` automate this on Windows. This path needs a local
MySQL server — the Docker path above does not.

## Troubleshooting

- **Backend keeps restarting on first run:** normal for a few seconds while
  it waits for MySQL's healthcheck; it retries automatically and settles.
- **Port already in use:** something else is using 3000/8000/3307 — stop it,
  or edit the host-side ports in `docker-compose.yml`.

## Safety

VitalSignAI provides an AI/ML-based diabetes risk *estimate* for
educational and preventive purposes. It is not a medical diagnosis and does
not replace a healthcare professional. For emergency symptoms, seek
immediate professional care.
