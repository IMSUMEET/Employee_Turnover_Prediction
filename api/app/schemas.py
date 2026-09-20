"""Request / response models for the API."""

from typing import Literal

from pydantic import BaseModel, Field

Salary = Literal["low", "medium", "high"]


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=6, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class Employee(BaseModel):
    name: str | None = None
    department: str
    promoted: int = Field(ge=0, le=1)
    review: float = Field(ge=0, le=1)
    projects: int = Field(ge=0, le=50)
    salary: Salary
    tenure: float = Field(ge=0, le=60)
    satisfaction: float = Field(ge=0, le=1)
    bonus: int = Field(ge=0, le=1)
    avg_hrs_month: float = Field(ge=0, le=744)


class Driver(BaseModel):
    feature: str
    label: str
    value: float | str
    impact: float          # signed contribution to the risk (SHAP)
    direction: Literal["increases", "decreases"]


class Prediction(BaseModel):
    name: str | None = None
    risk: float            # 0-100
    will_leave: bool
    band: Literal["low", "medium", "high"]
    drivers: list[Driver]
    recommendations: list[str]


class DepartmentStat(BaseModel):
    department: str
    headcount: int
    at_risk: int
    avg_risk: float


class BatchAnalytics(BaseModel):
    total: int
    at_risk: int
    avg_risk: float
    bands: dict[str, int]
    by_department: list[DepartmentStat]
    top_drivers: list[Driver]


class BatchResult(BaseModel):
    predictions: list[Prediction]
    analytics: BatchAnalytics
