from fastapi import APIRouter, HTTPException, Request
from app.db.session import database
from app.core.auth import require_role

router = APIRouter(prefix="/payment-info", tags=["payment-info"])


@router.get("/{user_id}")
async def get_payment_info(user_id: str, request: Request):
    _, auth_user_id = require_role(request, {"customer", "chef"})

    if user_id != auth_user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    return await database.fetch_one(
        """
        SELECT *
        FROM payment_info
        WHERE user_id = :user_id
        """,
        {"user_id": user_id},
    )


@router.post("")
async def create_payment_info(data: dict, request: Request):
    _, user_id = require_role(request, {"customer"})

    payment_id = await database.fetch_val("SELECT COALESCE(MAX(payment_id), 0) + 1 FROM payment_info")

    await database.execute(
        """
        INSERT INTO payment_info (
            payment_id, user_id, name_on_card, cc_number, exp_month, exp_year, cvc
        )
        VALUES (
            :payment_id, :user_id, :name_on_card, :cc_number, :exp_month, :exp_year, :cvc
        )
        """,
        {"payment_id": payment_id, "user_id": user_id, **data},
    )

    return {"payment_id": payment_id}


@router.delete("/{payment_id}")
async def delete_payment(payment_id: int, request: Request):
    _, user_id = require_role(request, {"customer"})

    await database.execute(
        """
        DELETE FROM payment_info
        WHERE payment_id = :payment_id AND user_id = :user_id
        """,
        {"payment_id": payment_id, "user_id": user_id},
    )

    return {"message": "deleted"}