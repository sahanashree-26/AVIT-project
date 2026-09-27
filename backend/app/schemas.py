from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# ---------- Auth ----------

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    age: int = Field(ge=1, le=120)
    gender: str = Field(min_length=1, max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Profile (account) ----------

class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    age: int
    gender: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    age: Optional[int] = Field(default=None, ge=1, le=120)
    gender: Optional[str] = Field(default=None, min_length=1, max_length=20)


# ---------- Health Profile (lifestyle / body facts) ----------

class HealthProfileRequest(BaseModel):
    height_cm: Optional[float] = Field(default=None, gt=0, le=260)
    weight_kg: Optional[float] = Field(default=None, gt=0, le=400)
    blood_pressure_systolic: Optional[int] = Field(default=None, gt=0, le=300)
    blood_pressure_diastolic: Optional[int] = Field(default=None, gt=0, le=200)
    physical_activity_level: Optional[str] = Field(default=None, max_length=30)
    sleep_hours: Optional[float] = Field(default=None, ge=0, le=24)
    smoking: Optional[bool] = None
    alcohol: Optional[bool] = None
    family_history_diabetes: Optional[bool] = None
    existing_conditions: Optional[str] = Field(default=None, max_length=1000)
    medications: Optional[str] = Field(default=None, max_length=1000)


class HealthProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    height_cm: Optional[float]
    weight_kg: Optional[float]
    bmi: Optional[float]
    blood_pressure_systolic: Optional[int]
    blood_pressure_diastolic: Optional[int]
    physical_activity_level: Optional[str]
    sleep_hours: Optional[float]
    smoking: Optional[bool]
    alcohol: Optional[bool]
    family_history_diabetes: Optional[bool]
    existing_conditions: Optional[str]
    medications: Optional[str]
    updated_at: Optional[datetime]


# ---------- Assessment ----------

class AssessmentRequest(BaseModel):
    pregnancies: int = Field(ge=0, le=20)
    glucose: float = Field(gt=0, le=300)
    blood_pressure: float = Field(gt=0, le=250)
    skin_thickness: float = Field(ge=0, le=100)
    insulin: float = Field(ge=0, le=900)
    bmi: float = Field(gt=0, le=80)
    diabetes_pedigree: float = Field(gt=0, le=3)
    age: int = Field(ge=1, le=120)


class FactorContribution(BaseModel):
    feature: str
    value: float
    contribution: float


class ExplanationResponse(BaseModel):
    risk_factors: List[FactorContribution]
    protective_factors: List[FactorContribution]


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    pregnancies: int
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: int
    prediction: str
    risk_category: str
    probability: float
    created_at: datetime


class AssessmentDetailResponse(AssessmentResponse):
    explanation: Optional[ExplanationResponse] = None


# ---------- Health Metrics ----------

class HealthMetricRequest(BaseModel):
    metric_type: str = Field(pattern="^(glucose|weight|bmi|blood_pressure)$")
    value: float = Field(gt=0, le=1000)
    unit: Optional[str] = Field(default=None, max_length=20)


class HealthMetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    metric_type: str
    value: float
    unit: Optional[str]
    source: str
    recorded_at: datetime


# ---------- Reports ----------

class ReportMetricRequest(BaseModel):
    metric_name: str = Field(min_length=1, max_length=60)
    value: float
    unit: Optional[str] = Field(default=None, max_length=20)
    reference_range: Optional[str] = Field(default=None, max_length=60)


class ReportMetricResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    metric_name: str
    value: float
    unit: Optional[str]
    reference_range: Optional[str]
    entry_method: str


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    file_type: str
    file_size_bytes: int
    status: str
    uploaded_at: datetime
    metrics: List[ReportMetricResponse] = []
