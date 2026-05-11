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
    assert payload["monthly_chart"][0]["month_key"] == "2026-05"


def test_admin_commission_transactions_requires_admin(client):
    response = client.get(
        "/admin/revenue/commission-transactions",
        headers={"X-User-Role": "chef", "X-User-Id": "chef_01"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "You are not allowed to do this."


def test_admin_detail_transaction_endpoints_return_rows(client, monkeypatch):
    async def fake_fetch_all(query, values=None):
        if "FROM request r" in query:
            return [
                {
                    "request_id": 1012,
                    "customer_id": "cust_03",
                    "customer_name": "Julia Child",
                    "chef_id": "chef_15",
                    "chef_name": "José Andrés",
                    "status": "completed",
                    "created_at": "2026-05-06 18:50:00",
                    "price": 500,
                    "commission": 75,
                    "summary": "Large birthday dinner",
                }
            ]
        if "FROM chef_sponsorship s" in query:
            return [
                {
                    "sponsorship_id": 707,
                    "chef_id": "chef_05",
                    "chef_name": "Missy Robbins",
                    "price": 219,
                    "purchase_timestamp": "2026-05-03 13:05:00",
                    "start_date": "2026-05-03",
                    "end_date": "2026-11-03",
                    "payment_info_used_id": 106,
                }
            ]
        raise AssertionError(f"Unexpected fetch_all query: {query}")

    monkeypatch.setattr(session.database, "fetch_all", fake_fetch_all)

    headers = {"X-User-Role": "admin", "X-User-Id": "admin_01"}

    commission_response = client.get("/admin/revenue/commission-transactions", headers=headers)
    assert commission_response.status_code == 200
    commission_payload = commission_response.json()
    assert commission_payload["count"] == 1
    assert commission_payload["transactions"][0]["request_id"] == 1012
    assert commission_payload["transactions"][0]["commission"] == 75.0

    sponsorship_response = client.get("/admin/revenue/sponsorship-transactions", headers=headers)
    assert sponsorship_response.status_code == 200
    sponsorship_payload = sponsorship_response.json()
    assert sponsorship_payload["count"] == 1
    assert sponsorship_payload["transactions"][0]["sponsorship_id"] == 707
    assert sponsorship_payload["transactions"][0]["price"] == 219.0


def test_generate_monthly_payouts_calls_stored_procedure(client, monkeypatch):
    execute_calls = []

    async def fake_execute(query, values=None):
        execute_calls.append((query, values))
        return None

    async def fake_fetch_all(query, values=None):
        if "FROM chef_monthly_payout p" in query:
            return [
                {
                    "chef_id": "chef_01",
                    "chef_name": "Gordon Ramsay",
                    "payout_month": "2026-05-01",
                    "gross_revenue": 835,
                    "total_commission": 125.25,
                    "net_payout": 709.75,
                    "request_count": 3,
                    "generated_at": "2026-05-11 12:00:00",
                }
            ]
        raise AssertionError(f"Unexpected fetch_all query: {query}")

    monkeypatch.setattr(session.database, "execute", fake_execute)
    monkeypatch.setattr(session.database, "fetch_all", fake_fetch_all)

    response = client.post(
        "/admin/payouts/generate?month=2026-05-01",
        headers={"X-User-Role": "admin", "X-User-Id": "admin_01"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == "Payouts generated."
    assert payload["month"] == "2026-05-01"
    assert payload["count"] == 1
    assert payload["payouts"][0]["chef_id"] == "chef_01"

    assert any(
        "CALL generate_chef_payouts(:p_month)" in query
        for query, _ in execute_calls
    )
