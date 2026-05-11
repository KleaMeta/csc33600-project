from fastapi import APIRouter, Request
from app.db.session import database
from app.core.auth import require_role

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/transactions")
async def get_transactions(request: Request):
    role, user_id = require_role(request, {"chef", "customer"})

    if role == "customer":
        rows = await database.fetch_all(
            """
            SELECT
                request_id AS id,
                price AS amount,
                status,
                created_at
            FROM request
            WHERE customer_id = :user_id
            ORDER BY created_at DESC
            """,
            {"user_id": user_id},
        )

    else:
        rows = await database.fetch_all(
            """
            SELECT
                request_id AS id,
                price AS amount,
                status,
                created_at
            FROM request
            WHERE chef_id = :user_id
            ORDER BY created_at DESC
            """,
            {"user_id": user_id},
        )

    return rows