# VitalSignAI — Presentation Content (8 slides)

---

## Slide 1 — Team Members
*(Layout: simple centered title + name list)*

**VitalSignAI**
AI-Based Early Diabetes Risk Prediction

Team Members:
- [Your Name] — [Roll Number]
- [Add teammates if any]

Guide: [Guide Name]

---

## Slide 2 — Problem Statement & Solution
*(Layout: two-column — left "Problem", right "Solution")*

**Problem**
Diabetes risk can be difficult to judge from raw health numbers alone —
there's no simple, self-serve, ML-based tool for early awareness.

**Solution**
VitalSignAI lets a user enter 8 standard health measurements and get an
instant, ML-based early risk prediction with a confidence score, saved to
their personal history.

---

## Slide 3 — Project Flowchart
*(Layout: vertical flow diagram)*

Register/Login → Health Assessment Form → FastAPI Backend →
Logistic Regression Model → Prediction + Probability →
Saved to MySQL → Shown to User → My Assessments (history)

---

## Slide 4 — How Machine Learning Works
*(Layout: NOT a flowchart — explanatory text + one simple visual of the sigmoid curve)*

**Algorithm: Logistic Regression**

Logistic Regression estimates the *probability* of a binary outcome (diabetes
risk: yes/no) from a weighted combination of input features, passed through
the sigmoid function:

  probability = 1 / (1 + e^-(w·x + b))

- Trained once on labeled health data (8 features → Outcome).
- At prediction time, it outputs both the class (risk / no risk) and the
  probability, which is shown to the user as "model confidence".
- Chosen for this project because it's simple, fast, and easy to explain in
  a viva — appropriate scope for a final-year project.

---

## Slide 5 — Technical Implementation
*(Layout: architecture diagram + short bullet list, not just boxes)*

**Frontend:** React + Vite + Tailwind CSS + React Router
**Backend:** Python + FastAPI + SQLAlchemy + Pydantic
**ML:** scikit-learn Logistic Regression, trained offline and saved with
joblib, loaded once at server startup (never retrained per request)
**Database:** MySQL, tables auto-created via SQLAlchemy
**Auth:** PBKDF2-hashed passwords + JWT session tokens

---

## Slide 6 — User Interface
*(Layout: screenshot grid, 2x3 or 3x2)*

Screens to capture from the running application:
1. Home
2. About
3. Health Assessment (form)
4. Prediction Result
5. My Assessments (history)
6. Profile

*(Run the app locally with `run.bat`, then take real screenshots — do not
use placeholder/fake images.)*

---

## Slide 7 — Tools & Technologies
*(Layout: icon/logo grid — React, Vite, Tailwind, Python, FastAPI, MySQL, scikit-learn, Pandas, NumPy, joblib, VS Code, Git)*

Development: VS Code + Git + GitHub
Deployment (cloud-ready): Vercel (frontend) + Render (backend) + managed
cloud MySQL

---

## Slide 8 — Thank You
*(Layout: simple closing slide)*

**Thank You**
Questions?

[Your Name] · [Email/Contact] · [GitHub link]
