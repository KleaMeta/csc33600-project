from unittest.mock import AsyncMock
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db import session
from app.main import app


@pytest.fixture
def client(monkeypatch):
    """Create a test client with DB connect/disconnect mocked out."""

    monkeypatch.setattr(session.database, "connect", AsyncMock())
    monkeypatch.setattr(session.database, "disconnect", AsyncMock())

    with TestClient(app) as test_client:
        yield test_client


def test_admin_login_success(client, monkeypatch):
    async def fake_fetch_one(query, values=None):
        if "type_of_user = 'admin'" in query and values["email"] == "admin@gmail.com":
            return {
                "admin_id": "admin_01",
                "name": "Admin User",
                "email": "admin@gmail.com",
                "password_hash": "pass",
            }
        return None

    monkeypatch.setattr(session.database, "fetch_one", fake_fetch_one)

    response = client.post(
        "/admin-login",
        json={"email": "admin@gmail.com", "password": "pass"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["role"] == "admin"
    assert payload["user_id"] == "admin_01"
    assert payload["email"] == "admin@gmail.com"


def test_admin_login_rejects_wrong_password(client, monkeypatch):
    async def fake_fetch_one(query, values=None):
        if "type_of_user = 'admin'" in query and values["email"] == "admin@gmail.com":
            return {
                "admin_id": "admin_01",
                "name": "Admin User",
                "email": "admin@gmail.com",
                "password_hash": "pass",
            }
        return None

    monkeypatch.setattr(session.database, "fetch_one", fake_fetch_one)

    response = client.post(
        "/admin-login",
        json={"email": "admin@gmail.com", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


def test_admin_revenue_summary_requires_admin_headers(client):
    response = client.get("/admin/revenue/summary")
    assert response.status_code == 401
    assert response.json()["detail"] == "You must be logged in."


def test_admin_revenue_summary_includes_commission_and_sponsorship(client, monkeypatch):
    async def fake_fetch_one(query, values=None):
        if "total_revenue" in query and "total_commission" in query:
            return {
                "total_revenue": 1000,
                "total_commission": 150,
                "total_bookings": 8,
            }
        if "total_sponsorship_revenue" in query:
            return {
                "total_sponsorship_revenue": 500,
                "total_sponsorship_count": 3,
            }
        if (
            "AS revenue" in query
            and "AS commission" in query
            and "CURRENT_DATE)" in query
            and "INTERVAL '1 month'" not in query
        ):
            return {"revenue": 400, "commission": 60, "bookings": 3}
        if "AS revenue" in query and "AS commission" in query and "INTERVAL '1 month'" in query:
            return {"revenue": 300, "commission": 45, "bookings": 2}
        raise AssertionError(f"Unexpected fetch_one query: {query}")

    async def fake_fetch_val(query, values=None):
        if "SELECT COUNT(*) FROM request WHERE status = 'pending'" in query:
            return 2
        if "COUNT(DISTINCT chef_id)" in query:
            return 2
        if "SELECT COUNT(*) FROM chef_data" in query:
            return 6
        if "FROM chef_sponsorship" in query and "CURRENT_DATE)" in query and "INTERVAL '1 month'" not in query:
            return 200
        if "FROM chef_sponsorship" in query and "INTERVAL '1 month'" in query:
            return 100
        raise AssertionError(f"Unexpected fetch_val query: {query}")

    async def fake_fetch_all(query, values=None):
        if "COUNT(*) FILTER (WHERE status = 'completed')" in query:
            return [
                {
                    "month": "May",
                    "month_date": "2026-05-01",
                    "revenue": 400,
                    "commission": 60,
                    "bookings": 3,
                    "completed": 1,
                    "active": 2,
                }
            ]
        if "purchase_timestamp" in query and "sponsorship_revenue" in query:
            return [
                {
                    "month_date": "2026-05-01",
                    "sponsorship_revenue": 200,
                    "sponsorship_count": 1,
                }
            ]
        if "created_at >= CURRENT_DATE - INTERVAL '12 months'" in query:
            return [
                {
                    "month": "Nov",
                    "month_date": "2025-11-01",
                    "revenue": 300,
                    "commission": 45,
                }
            ]
        if "WHERE status IN ('accepted', 'completed', 'pending')" in query:
            return [
                {"status": "accepted", "revenue": 600, "count": 4},
                {"status": "completed", "revenue": 400, "count": 4},
                {"status": "pending", "revenue": 120, "count": 2},
            ]
        if "ROUND(AVG(rv.num_stars), 1)" in query:
            return [
                {
                    "name": "Gordon Ramsay",
                    "chef_id": "chef_01",
                    "revenue": 500,
                    "commission": 75,
                    "bookings": 4,
                    "avg_rating": 4.8,
                }
            ]
        raise AssertionError(f"Unexpected fetch_all query: {query}")

    monkeypatch.setattr(session.database, "fetch_one", fake_fetch_one)
    monkeypatch.setattr(session.database, "fetch_val", fake_fetch_val)
    monkeypatch.setattr(session.database, "fetch_all", fake_fetch_all)

    response = client.get(
        "/admin/revenue/summary",
        headers={"X-User-Role": "admin", "X-User-Id": "admin_01"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["totals"]["commission"] == 150.0
    assert payload["totals"]["sponsorship_revenue"] == 500.0
    assert payload["totals"]["developer_revenue"] == 650.0
    assert payload["this_month"]["sponsorship_revenue"] == 200.0
    assert payload["this_month"]["developer_revenue"] == 260.0
