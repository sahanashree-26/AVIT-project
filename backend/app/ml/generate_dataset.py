"""
generate_dataset.py

IMPORTANT / HONESTY NOTE:
This script generates a SYNTHETIC diabetes screening dataset. It was built
without internet access, so the real "Pima Indians Diabetes Dataset" could
not be downloaded. The synthetic data below uses the same 8 standard
features and the same realistic value ranges / clinical relationships
(e.g. higher Glucose and BMI increase diabetes risk), and is generated with
a fixed random seed so results are reproducible.

If your college requires the original Pima Indians Diabetes Dataset, download
diabetes.csv from Kaggle ("Pima Indians Diabetes Database") and drop it at
backend/data/diabetes.csv with the same column names — train.py will use it
automatically instead of generating synthetic data.
"""
import numpy as np
import pandas as pd
import os

RNG = np.random.default_rng(42)
N = 900  # number of synthetic patients

def generate():
    pregnancies = RNG.poisson(2.2, N).clip(0, 15)
    age = RNG.normal(33, 11, N).clip(21, 81).round().astype(int)

    # Glucose correlates with age + latent risk factor
    latent_risk = RNG.normal(0, 1, N)
    glucose = (100 + 0.5 * age + 18 * latent_risk + RNG.normal(0, 12, N)).clip(44, 199)

    blood_pressure = (65 + 0.25 * age + 6 * latent_risk + RNG.normal(0, 9, N)).clip(24, 122)
    skin_thickness = (20 + 4 * latent_risk + RNG.normal(0, 8, N)).clip(0, 99)
    bmi = (28 + 3.5 * latent_risk + RNG.normal(0, 5, N)).clip(15, 67)
    insulin = (80 + 25 * latent_risk + RNG.normal(0, 60, N)).clip(0, 846)
    dpf = (0.35 + 0.15 * latent_risk + RNG.normal(0, 0.2, N)).clip(0.08, 2.42)

    # Outcome driven by a logistic combination of the true clinical drivers
    z = (
        -9.7
        + 0.038 * glucose
        + 0.09 * bmi
        + 0.045 * age
        + 0.15 * pregnancies
        + 0.6 * dpf
        + 0.9 * latent_risk
    )
    prob = 1 / (1 + np.exp(-z))
    outcome = (RNG.random(N) < prob).astype(int)

    df = pd.DataFrame({
        "Pregnancies": pregnancies,
        "Glucose": glucose.round(1),
        "BloodPressure": blood_pressure.round(1),
        "SkinThickness": skin_thickness.round(1),
        "Insulin": insulin.round(1),
        "BMI": bmi.round(1),
        "DiabetesPedigreeFunction": dpf.round(3),
        "Age": age,
        "Outcome": outcome,
    })
    return df

if __name__ == "__main__":
    df = generate()
    out_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "diabetes.csv")
    out_path = os.path.abspath(out_path)
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} rows to {out_path}")
    print(df["Outcome"].value_counts(normalize=True))
