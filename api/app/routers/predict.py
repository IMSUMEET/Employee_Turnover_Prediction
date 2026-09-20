"""Prediction endpoints: single, batch (CSV), and model info."""

import csv
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from ..deps import current_user
from ..model import get_model
from ..schemas import BatchResult, Employee, Prediction

router = APIRouter(tags=["predict"])

_NUMERIC = {
    "promoted": int,
    "review": float,
    "projects": int,
    "tenure": float,
    "satisfaction": float,
    "bonus": int,
    "avg_hrs_month": float,
}


@router.post("/predict", response_model=Prediction)
def predict_one(employee: Employee, _: str = Depends(current_user)):
    return get_model().predict(employee.model_dump())


@router.post("/predict/batch", response_model=BatchResult)
async def predict_batch(
    file: UploadFile = File(...), _: str = Depends(current_user)
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload a .csv file"
        )
    raw = (await file.read()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(raw))
    required = set(Employee.model_fields) - {"name"}
    if not required.issubset(set(reader.fieldnames or [])):
        missing = required - set(reader.fieldnames or [])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV is missing columns: {', '.join(sorted(missing))}",
        )

    employees = []
    for i, row in enumerate(reader, start=2):
        try:
            emp = {"name": (row.get("name") or f"Employee {i - 1}").strip()}
            emp["department"] = row["department"].strip()
            emp["salary"] = row["salary"].strip().lower()
            for key, cast in _NUMERIC.items():
                emp[key] = cast(float(row[key]))
            Employee(**emp)  # validate ranges
            employees.append(emp)
        except (ValueError, KeyError) as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Row {i} is invalid: {exc}",
            )

    if not employees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="The CSV had no data rows"
        )
    return get_model().predict_batch(employees)


@router.get("/model/info")
def model_info(_: str = Depends(current_user)):
    m = get_model()
    return {
        "dataset": m.meta["dataset"],
        "metrics": m.meta["metrics"],
        "feature_importance": m.meta["feature_importance"],
        "model_comparison": m.meta["model_comparison"],
        "labels": m.labels,
    }
