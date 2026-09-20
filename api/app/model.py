"""Model service: risk scoring, SHAP explanations, recommendations, analytics.

The served model is a CatBoost classifier. CatBoost exposes SHAP values
natively (`get_feature_importance(type="ShapValues")`), which lets us explain
every single prediction without pulling in a separate SHAP dependency.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from catboost import CatBoostClassifier, Pool

ARTIFACTS = Path(__file__).resolve().parent / "model_artifacts"

# Human-readable, actionable suggestions keyed by the feature raising risk.
_RECS = {
    "avg_hrs_month": "Workload looks heavy - review capacity and watch for burnout signs.",
    "satisfaction": "Satisfaction is low - schedule a 1:1 check-in and act on feedback.",
    "review": "Recent review is weak - offer coaching and a clear improvement plan.",
    "tenure": "Long tenure without change - discuss a growth path or a new challenge.",
    "bonus": "No recent bonus - consider recognition or a spot reward.",
    "promoted": "No recent promotion - map out a realistic progression timeline.",
    "salary": "Compensation may lag the market - benchmark and review the package.",
    "projects": "Project load looks off - rebalance assignments to a healthy level.",
    "department": "Department shows elevated attrition - review team-level drivers.",
}


def _band(risk: float) -> str:
    if risk >= 66:
        return "high"
    if risk >= 40:
        return "medium"
    return "low"


class ModelService:
    def __init__(self) -> None:
        self.meta = json.loads((ARTIFACTS / "metadata.json").read_text())
        self.features: list[str] = self.meta["features"]
        self.cat_features: list[str] = self.meta["cat_features"]
        self.labels: dict[str, str] = self.meta["labels"]
        self.cat_idx = [self.features.index(c) for c in self.cat_features]
        self.model = CatBoostClassifier()
        self.model.load_model(str(ARTIFACTS / "model.cbm"))

    # -- row helpers ------------------------------------------------------- #
    def _row(self, emp: dict) -> list:
        row = []
        for f in self.features:
            v = emp[f]
            row.append(str(v) if f in self.cat_features else v)
        return row

    def _pool(self, rows: list[list]) -> Pool:
        return Pool(rows, cat_features=self.cat_idx)

    # -- single prediction ------------------------------------------------- #
    def predict(self, emp: dict) -> dict:
        rows = [self._row(emp)]
        pool = self._pool(rows)
        risk = float(self.model.predict_proba(pool)[0, 1]) * 100
        shap = self.model.get_feature_importance(pool, type="ShapValues")[0]
        drivers = self._drivers(emp, shap[:-1])
        return {
            "name": emp.get("name"),
            "risk": round(risk, 1),
            "will_leave": risk >= 50,
            "band": _band(risk),
            "drivers": drivers,
            "recommendations": self._recommendations(drivers),
        }

    def _drivers(self, emp: dict, shap_row: np.ndarray, top: int = 5) -> list[dict]:
        pairs = []
        for f, s in zip(self.features, shap_row):
            pairs.append(
                {
                    "feature": f,
                    "label": self.labels[f],
                    "value": emp[f],
                    "impact": round(float(s), 4),
                    "direction": "increases" if s >= 0 else "decreases",
                }
            )
        pairs.sort(key=lambda d: abs(d["impact"]), reverse=True)
        return pairs[:top]

    def _recommendations(self, drivers: list[dict], limit: int = 3) -> list[str]:
        recs = []
        for d in drivers:
            if d["direction"] == "increases" and d["feature"] in _RECS:
                rec = _RECS[d["feature"]]
                if rec not in recs:
                    recs.append(rec)
            if len(recs) >= limit:
                break
        if not recs:
            recs.append("No major risk factors - keep up the current engagement.")
        return recs

    # -- batch prediction + analytics ------------------------------------- #
    def predict_batch(self, employees: list[dict]) -> dict:
        rows = [self._row(e) for e in employees]
        pool = self._pool(rows)
        probs = self.model.predict_proba(pool)[:, 1] * 100
        shap = self.model.get_feature_importance(pool, type="ShapValues")

        predictions = []
        for emp, risk, shap_row in zip(employees, probs, shap):
            drivers = self._drivers(emp, shap_row[:-1])
            predictions.append(
                {
                    "name": emp.get("name"),
                    "risk": round(float(risk), 1),
                    "will_leave": bool(risk >= 50),
                    "band": _band(float(risk)),
                    "drivers": drivers,
                    "recommendations": self._recommendations(drivers),
                }
            )

        analytics = self._analytics(employees, probs, shap[:, :-1])
        return {"predictions": predictions, "analytics": analytics}

    def _analytics(
        self, employees: list[dict], probs: np.ndarray, shap: np.ndarray
    ) -> dict:
        total = len(employees)
        at_risk = int((probs >= 50).sum())
        bands = {"low": 0, "medium": 0, "high": 0}
        for p in probs:
            bands[_band(float(p))] += 1

        # department rollup
        dept_map: dict[str, dict] = {}
        for emp, p in zip(employees, probs):
            d = dept_map.setdefault(
                emp["department"], {"headcount": 0, "at_risk": 0, "sum": 0.0}
            )
            d["headcount"] += 1
            d["at_risk"] += int(p >= 50)
            d["sum"] += float(p)
        by_department = sorted(
            (
                {
                    "department": name,
                    "headcount": v["headcount"],
                    "at_risk": v["at_risk"],
                    "avg_risk": round(v["sum"] / v["headcount"], 1),
                }
                for name, v in dept_map.items()
            ),
            key=lambda x: x["avg_risk"],
            reverse=True,
        )

        # global top drivers = mean absolute SHAP across the batch
        mean_abs = np.abs(shap).mean(axis=0)
        signed_mean = shap.mean(axis=0)
        order = np.argsort(mean_abs)[::-1][:5]
        top_drivers = [
            {
                "feature": self.features[i],
                "label": self.labels[self.features[i]],
                "value": round(float(mean_abs[i]), 4),
                "impact": round(float(signed_mean[i]), 4),
                "direction": "increases" if signed_mean[i] >= 0 else "decreases",
            }
            for i in order
        ]

        return {
            "total": total,
            "at_risk": at_risk,
            "avg_risk": round(float(probs.mean()), 1),
            "bands": bands,
            "by_department": by_department,
            "top_drivers": top_drivers,
        }


_service: ModelService | None = None


def get_model() -> ModelService:
    global _service
    if _service is None:
        _service = ModelService()
    return _service
