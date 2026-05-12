from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Request
from app.db.session import database
from app.core.auth import require_role

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/transactions")
async def get_transactions(request: Request):
    """Get transaction history for customer or chef"""
    role, user_id = require_role(request, {"chef", "customer"})

    if role == "customer":
        rows = await database.fetch_all(
            """
            SELECT
                request_id AS id,
                price AS amount,
                status,
                created_at AS date,
                summary
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
                created_at AS date,
                summary
            FROM request
            WHERE chef_id = :user_id
            ORDER BY created_at DESC
            """,
            {"user_id": user_id},
        )

    transactions = []
    for row in rows:
        transaction = dict(row)
        if transaction.get("status"):
            transaction["status"] = str(transaction["status"]).lower()
        transactions.append(transaction)
    
    return transactions