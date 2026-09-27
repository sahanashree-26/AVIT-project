# VitalSignAI — Viva Questions & Answers

**What is VitalSignAI?**
A web application that predicts a person's early diabetes risk from 8
standard health measurements, using a trained Logistic Regression model,
with results stored per-user in MySQL.

**Why diabetes?**
Diabetes is common, has well-known measurable risk factors (glucose, BMI,
age, etc.), and has a well-known public dataset structure (8 features, 1
binary outcome) that suits a focused, explainable final-year project.

**Why Logistic Regression?**
It's a simple, fast, well-understood classification algorithm that
naturally outputs a probability (not just a class label), which is easy to
explain and to show as "model confidence" to the user. It avoids the
complexity of ensemble or deep learning models, which isn't needed for this
scope.

**What is Logistic Regression?**
A statistical classification algorithm that estimates the probability of a
binary outcome by applying the sigmoid function to a weighted sum of the
input features. If the probability is ≥ 0.5, the model predicts the
positive class.

**Why MySQL?**
It's a widely-used, reliable relational database, well suited to the
project's simple two-table schema (`users`, `assessments`) with a clear
foreign-key relationship, and it's cloud-portable (can be swapped for a
managed MySQL provider later with no code changes).

**Why FastAPI?**
It's a modern, fast Python web framework with automatic request validation
(via Pydantic) and automatic interactive API docs (Swagger UI at `/docs`),
which speeds up development and testing.

**Why React?**
A widely-used frontend library for building interactive single-page
applications with reusable components — well suited to a multi-page flow
like Register → Assessment → Result → History.

**What is SQLAlchemy?**
A Python ORM (Object-Relational Mapper) that lets the backend define
database tables as Python classes and query them with Python code instead
of writing raw SQL, while still using a real MySQL database underneath.

**What dataset was used?**
A synthetic dataset with the same 8 features and value ranges as the
well-known Pima Indians Diabetes Dataset, generated with a fixed random
seed for reproducibility (built without internet access; see README for
swapping in the original dataset).

**What are the input features?**
Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI,
DiabetesPedigreeFunction, Age.

**What is the target variable?**
`Outcome` — 0 for no diabetes risk, 1 for diabetes risk detected.

**What is train-test split?**
Dividing the dataset into a training portion (used to fit the model) and a
separate test portion (used to evaluate it on unseen data) — this project
uses an 80/20 stratified split.

**What is accuracy?**
The percentage of all predictions (both classes) that were correct.

**What is precision?**
Of all cases the model predicted as "diabetes risk," the percentage that
were actually correct.

**What is recall?**
Of all the actual "diabetes risk" cases, the percentage the model correctly
identified.

**What is F1-score?**
The harmonic mean of precision and recall — a single balanced score useful
when you care about both false positives and false negatives.

**How does frontend communicate with backend?**
The React frontend calls the FastAPI backend's REST endpoints over HTTP
using `fetch`, sending/receiving JSON, with a JWT bearer token attached to
authenticated requests.

**How is prediction stored in MySQL?**
After the model returns a prediction and probability, the backend creates
an `Assessment` row (via SQLAlchemy) linked to the logged-in user's `id`
and commits it to the `assessments` table.

**What are the limitations?**
Trained on synthetic (not the original) data; single algorithm by design;
not validated against real clinical data; not a diagnostic tool.

**Is this a medical diagnosis?**
No. The result is an ML-based early risk indication for educational and
screening purposes only, clearly labeled as such in the UI.

**What are future enhancements?**
Using the real published dataset, adding risk-trend visualizations over
time, password reset via email, and cloud deployment (Vercel + Render +
managed MySQL).
