"""Schema for banking form submissions."""

from fastapi import APIRouter, HTTPException, Request

from app.core.auth import require_role
from app.db.session import database
from app.schemas.banking import (
    PaymentInfoCreate,
    ChefBankInfoCreate,
)

router = APIRouter(prefix="/api/banking", tags=["banking"])


# ---------------------------------------------------
# CUSTOMER PAYMENT METHODS
# ---------------------------------------------------

@router.get("/cards")
async def get_cards(request: Request):
    _, user_id = require_role(request, {"customer"})

    rows = await database.fetch_all(
        """
        SELECT
            payment_id,
            name_on_card,
            cc_number,
            exp_month,
            exp_year
        FROM payment_info
        WHERE user_id = :user_id
        ORDER BY payment_id DESC
        """,
        {"user_id": user_id},
    )

    results = []

    for row in rows:
        card_number = row["cc_number"]

        masked = (
            "**** **** **** " + card_number[-4:]
            if len(card_number) >= 4
            else "****"
        )

        results.append(
            {
                "payment_id": row["payment_id"],
                "name_on_card": row["name_on_card"],
                "card_last4": masked,
                "exp_month": row["exp_month"],
                "exp_year": row["exp_year"],
            }
        )

    return results


@router.post("/cards")
async def add_card(
    card_data: PaymentInfoCreate,
    request: Request,
):
    _, user_id = require_role(request, {"customer"})

    max_id = await database.fetch_val(
        "SELECT COALESCE(MAX(payment_id), 0) FROM payment_info"
    )

    payment_id = max_id + 1

    await database.execute(
        """
        INSERT INTO payment_info (
            payment_id,
            user_id,
            name_on_card,
            cc_number,
            exp_month,
            exp_year,
            cvc
        )
        VALUES (
            :payment_id,
            :user_id,
            :name_on_card,
            :cc_number,
            :exp_month,
            :exp_year,
            :cvc
        )
        """,
        {
            "payment_id": payment_id,
            "user_id": user_id,
            "name_on_card": card_data.name_on_card,
            "cc_number": card_data.cc_number,
            "exp_month": card_data.exp_month,
            "exp_year": card_data.exp_year,
            "cvc": card_data.cvc,
        },
    )

    return {
        "message": "Card added successfully.",
        "payment_id": payment_id,
    }


@router.delete("/cards/{payment_id}")
async def delete_card(
    payment_id: int,
    request: Request,
):
    _, user_id = require_role(request, {"customer"})

    result = await database.execute(
        """
        DELETE FROM payment_info
        WHERE payment_id = :payment_id
          AND user_id = :user_id
        """,
        {
            "payment_id": payment_id,
            "user_id": user_id,
        },
    )

    if result == 0:
        raise HTTPException(
            status_code=404,
            detail="Card not found.",
        )

    return {
        "message": "Card deleted successfully."
    }


# ---------------------------------------------------
# CHEF PAYOUT / BANK INFO
# ---------------------------------------------------

@router.get("/payout")
async def get_payout_info(request: Request):
    _, chef_id = require_role(request, {"chef"})

    row = await database.fetch_one(
        """
        SELECT
            bank_payment_id,
            account_number,
            routing_number
        FROM chef_bank_info
        WHERE chef_id = :chef_id
        """,
        {"chef_id": chef_id},
    )

    if not row:
        return None

    account_number = row["account_number"]

    masked_account = (
        "****" + account_number[-4:]
        if len(account_number) >= 4
        else "****"
    )

    return {
        "bank_payment_id": row["bank_payment_id"],
        "account_last4": masked_account,
        "routing_number": row["routing_number"],
    }


@router.post("/payout")
async def create_payout_info(
    payout_data: ChefBankInfoCreate,
    request: Request,
):
    _, chef_id = require_role(request, {"chef"})

    existing = await database.fetch_one(
        """
        SELECT bank_payment_id
        FROM chef_bank_info
        WHERE chef_id = :chef_id
        """,
        {"chef_id": chef_id},
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Payout account already exists.",
        )

    max_id = await database.fetch_val(
        "SELECT COALESCE(MAX(bank_payment_id), 0) FROM chef_bank_info"
    )

    bank_payment_id = max_id + 1

    await database.execute(
        """
        INSERT INTO chef_bank_info (
            bank_payment_id,
            chef_id,
            account_number,
            routing_number
        )
        VALUES (
            :bank_payment_id,
            :chef_id,
            :account_number,
            :routing_number
        )
        """,
        {
            "bank_payment_id": bank_payment_id,
            "chef_id": chef_id,
            "account_number": payout_data.account_number,
            "routing_number": payout_data.routing_number,
        },
    )

    return {
        "message": "Payout account created.",
        "bank_payment_id": bank_payment_id,
    }


@router.patch("/payout")
async def update_payout_info(
    payout_data: ChefBankInfoCreate,
    request: Request,
):
    _, chef_id = require_role(request, {"chef"})

    result = await database.execute(
        """
        UPDATE chef_bank_info
        SET
            account_number = :account_number,
            routing_number = :routing_number
        WHERE chef_id = :chef_id
        """,
        {
            "chef_id": chef_id,
            "account_number": payout_data.account_number,
            "routing_number": payout_data.routing_number,
        },
    )

    if result == 0:
        raise HTTPException(
            status_code=404,
            detail="Payout account not found.",
        )

    return {
        "message": "Payout account updated."
    }