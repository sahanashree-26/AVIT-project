from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(190), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    health_profile = relationship("HealthProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    health_metrics = relationship("HealthMetric", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")


class HealthProfile(Base):
    """One row per user. Lifestyle/body facts that don't change every assessment."""
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)  # auto-calculated from height+weight

    blood_pressure_systolic = Column(Integer, nullable=True)
    blood_pressure_diastolic = Column(Integer, nullable=True)

    physical_activity_level = Column(String(30), nullable=True)   # low / moderate / high
    sleep_hours = Column(Float, nullable=True)
    smoking = Column(Boolean, nullable=True)
    alcohol = Column(Boolean, nullable=True)
    family_history_diabetes = Column(Boolean, nullable=True)
    existing_conditions = Column(Text, nullable=True)   # free text, optional
    medications = Column(Text, nullable=True)            # free text, optional

    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User", back_populates="health_profile")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    pregnancies = Column(Integer, nullable=False)
    glucose = Column(Float, nullable=False)
    blood_pressure = Column(Float, nullable=False)
    skin_thickness = Column(Float, nullable=False)
    insulin = Column(Float, nullable=False)
    bmi = Column(Float, nullable=False)
    diabetes_pedigree = Column(Float, nullable=False)
    age = Column(Integer, nullable=False)

    prediction = Column(String(40), nullable=False)   # "Diabetes Risk Detected" / "No Diabetes Risk Detected"
    risk_category = Column(String(20), nullable=False, default="Lower Risk")  # Lower Risk / Higher Risk
    probability = Column(Float, nullable=False)        # 0.0 - 1.0
    explanation_json = Column(Text, nullable=True)      # JSON string: real per-feature contributions

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="assessments")


class HealthMetric(Base):
    """A single tracked measurement over time (glucose, weight, bmi, blood pressure...)."""
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    metric_type = Column(String(30), nullable=False)   # glucose | weight | bmi | blood_pressure
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=True)
    source = Column(String(20), nullable=False, default="manual")  # manual | assessment | report

    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="health_metrics")


class Report(Base):
    """An uploaded health/medical report file."""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)  # sanitized, unique on disk
    file_type = Column(String(10), nullable=False)          # pdf | jpg | png
    file_size_bytes = Column(Integer, nullable=False)

    status = Column(String(20), nullable=False, default="awaiting_review")  # awaiting_review | reviewed
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reports")
    metrics = relationship("ReportMetric", back_populates="report", cascade="all, delete-orphan")


class ReportMetric(Base):
    """A health value the user manually entered from a report (no OCR available)."""
    __tablename__ = "report_metrics"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False, index=True)

    metric_name = Column(String(60), nullable=False)   # Glucose | HbA1c | Blood Pressure | Weight | BMI | Cholesterol | Other
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=True)
    reference_range = Column(String(60), nullable=True)
    entry_method = Column(String(20), nullable=False, default="manual")

    report = relationship("Report", back_populates="metrics")
