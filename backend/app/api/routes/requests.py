"""Request submission and approval routes."""

from datetime import datetime, time

from fastapi import APIRouter, HTTPException, Request

from app.core.auth import require_role
from app.db.session import database
from app.schemas.request import HireChefRequest


router = APIRouter()


@router.post("/requests")
async def create_request(request_data: HireChefRequest, request: Request):
    """Create a new customer request with ingredient/equipment join rows."""

    _, customer_id = require_role(request, {"customer"})

    try:
        max_id = await database.fetch_val("SELECT COALESCE(MAX(request_id), 0) FROM request")
        request_id = max_id + 1

        await database.execute(
            """
            INSERT INTO request (request_id, customer_id, chef_id, accepted, price, date, summary)
            VALUES (:request_id, :customer_id, :chef_id, FALSE, :price, :date, :summary)
            """,
            {
                "request_id": request_id,
                "customer_id": customer_id,
                "chef_id": request_data.chef_id,
                "price": float(request_data.price),
                "date": datetime.combine(request_data.date, time.min),
                "summary": request_data.summary,
            },
        )

        for ingredient_name in request_data.ingredients:
            await database.execute(
                "INSERT INTO request_ingredient (request_id, ingredient_name) VALUES (:request_id, :ingredient_name)",
                {"request_id": request_id, "ingredient_name": ingredient_name},
            )

        for equipment_name in request_data.equipment:
            await database.execute(
                "INSERT INTO request_equipment (request_id, equipment_name) VALUES (:request_id, :equipment_name)",
                {"request_id": request_id, "equipment_name": equipment_name},
            )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc

    return {
        "message": "Request received.",
        "customer_id": customer_id,
        "request_id": request_id,
    }


@router.patch("/requests/{request_id}/approve")
async def approve_request(request_id: int, request: Request):
    """Approve a request as the logged-in chef."""

    _, chef_id = require_role(request, {"chef"})

    try:
        result = await database.execute(
            """
            UPDATE request SET chef_id = :chef_id, accepted = TRUE
            WHERE request_id = :request_id
            """,
            {"chef_id": chef_id, "request_id": request_id},
        )

        if result == 0:
            raise HTTPException(status_code=404, detail="Request not found.")

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc

    return {
        "message": "Request approved.",
        "request_id": request_id,
        "chef_id": chef_id,
        "accepted": True,
    }
