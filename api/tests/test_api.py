"""Smoke + behaviour tests for the AttritionIQ API."""

import io
import os
import tempfile

os.environ["DATABASE_URL"] = tempfile.mktemp(suffix=".db")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:  # triggers lifespan (DB init, model load)
        yield c

HIGH_RISK = {
    "department": "sales",
    "promoted": 0,
    "review": 0.35,
    "projects": 2,
    "salary": "low",
    "tenure": 9,
    "satisfaction": 0.2,
    "bonus": 0,
    "avg_hrs_month": 210,
}


def _token(client) -> str:
    r = client.post("/auth/register", json={"username": "tester", "password": "secret1"})
    assert r.status_code in (201, 409)
    r = client.post("/auth/login", json={"username": "tester", "password": "secret1"})
    assert r.status_code == 200
    return r.json()["access_token"]


def test_health(client):
    assert client.get("/health").json()["status"] == "ok"


def test_predict_requires_auth(client):
    assert client.post("/predict", json=HIGH_RISK).status_code == 401


def test_predict_single(client):
    token = _token(client)
    r = client.post("/predict", json=HIGH_RISK, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert 0 <= body["risk"] <= 100
    assert body["band"] in {"low", "medium", "high"}
    assert len(body["drivers"]) >= 1
    assert len(body["recommendations"]) >= 1


def test_predict_batch(client):
    token = _token(client)
    csv_data = (
        "name,department,promoted,review,projects,salary,tenure,satisfaction,bonus,avg_hrs_month\n"
        "Ada,sales,0,0.35,2,low,9,0.2,0,210\n"
        "Grace,engineering,1,0.9,3,high,2,0.95,1,165\n"
    )
    files = {"file": ("emp.csv", io.BytesIO(csv_data.encode()), "text/csv")}
    r = client.post("/predict/batch", files=files, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["analytics"]["total"] == 2
    assert len(body["predictions"]) == 2
    assert len(body["analytics"]["by_department"]) == 2


def test_model_info(client):
    token = _token(client)
    r = client.get("/model/info", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert "metrics" in r.json()
