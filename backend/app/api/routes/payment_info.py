from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from app.db.session import database
from app.core.auth import require_role
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/payment-info", tags=["payment-info"])


class PaymentInfoCreate(BaseModel):
    name_on_card: str
    cc_number: str
    exp_month: str
    exp_year: str
    cvc: str


@router.get("/{user_id}")
async def get_payment_info(user_id: str, request: Request):
    """Get payment info for a user"""
    role, auth_user_id = require_role(request, {"customer", "chef"})

    if user_id != auth_user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    result = await database.fetch_one(
        """
        SELECT payment_id, name_on_card, cc_number, exp_month, exp_year
        FROM payment_info
        WHERE user_id = :user_id
          AND status = 'active'
        """,
        {"user_id": user_id},
    )
    
    return result if result else {}


@router.post("")
async def create_payment_info(payment_data: PaymentInfoCreate, request: Request):
    """Create new payment info"""
    role, user_id = require_role(request, {"customer", "chef"})

    payment_id = await database.fetch_val(
        "SELECT COALESCE(MAX(payment_id), 0) + 1 FROM payment_info"
    )

    await database.execute(
        """
        INSERT INTO payment_info (
            payment_id, user_id, created_at, status,
            name_on_card, cc_number, exp_month, exp_year, cvc
        )
        VALUES (
            :payment_id, :user_id, :created_at, 'active',
            :name_on_card, :cc_number, :exp_month, :exp_year, :cvc
        )
        """,
        {
            "payment_id": payment_id,
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "name_on_card": payment_data.name_on_card,
            "cc_number": payment_data.cc_number,
            "exp_month": int(payment_data.exp_month),
            "exp_year": int(payment_data.exp_year),
            "cvc": int(payment_data.cvc),
        },
    )

    return {
        "payment_id": payment_id,
        "name_on_card": payment_data.name_on_card,
        "cc_number": payment_data.cc_number,
        "exp_month": payment_data.exp_month,
        "exp_year": payment_data.exp_year,
    }


@router.delete("/{payment_id}")
async def delete_payment(payment_id: int, request: Request):
    """Delete payment info"""
    role, user_id = require_role(request, {"customer"})

    result = await database.execute(
        """
        UPDATE payment_info
        SET status = 'deleted'
        WHERE payment_id = :payment_id
          AND user_id = :user_id
          AND status = 'active'
        """,
        {"payment_id": payment_id, "user_id": user_id},
    )

    if result == 0:
        raise HTTPException(status_code=404, detail="Payment info not found.")

    return {"message": "deleted"}