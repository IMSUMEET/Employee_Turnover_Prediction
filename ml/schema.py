"""Single source of truth for the model's feature contract.

Both the training pipeline (`ml/train.py`) and the serving API import from here
so the column order, categorical columns and human-readable labels can never
drift apart.
"""

# Order matters: this is exactly the order CatBoost was trained on.
FEATURES = [
    "department",
    "promoted",
    "review",
    "projects",
    "salary",
    "tenure",
    "satisfaction",
    "bonus",
    "avg_hrs_month",
]

# Columns CatBoost treats natively as categorical (no manual encoding needed).
CAT_FEATURES = ["department", "salary"]

TARGET = "left"

DEPARTMENTS = [
    "IT",
    "admin",
    "engineering",
    "finance",
    "logistics",
    "marketing",
    "operations",
    "retail",
    "sales",
    "support",
]

SALARY_LEVELS = ["low", "medium", "high"]

# Friendly labels used in the UI and in SHAP explanations.
LABELS = {
    "department": "Department",
    "promoted": "Promoted (last 24m)",
    "review": "Last review score",
    "projects": "Active projects",
    "salary": "Salary tier",
    "tenure": "Tenure (years)",
    "satisfaction": "Satisfaction",
    "bonus": "Bonus (last 24m)",
    "avg_hrs_month": "Avg hours / month",
}
