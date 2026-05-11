from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from app.db.session import database
from app.core.auth import require_role
from app.schemas.banking import PaymentInfoCreate

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
          AND status = 'active'
        """,
        {"user_id": user_id},
    )


@router.post("")
async def create_payment_info(payment_data: PaymentInfoCreate, request: Request):
    _, user_id = require_role(request, {"customer", "chef"})

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

    # Return full card object for UI preview
    return {
        "payment_id": payment_id,
        "name_on_card": payment_data.name_on_card,
        "cc_number": payment_data.cc_number,
        "exp_month": payment_data.exp_month,
        "exp_year": payment_data.exp_year,
        "cvc": payment_data.cvc,
    }


@router.delete("/{payment_id}")
async def delete_payment(payment_id: int, request: Request):
    _, user_id = require_role(request, {"customer"})

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

# Add this to your backend routes (e.g., in requests router)

@router.post("/api/requests/{request_id}/confirm")
async def confirm_request(
    request_id: str,
    confirmation: dict,  # Contains payment_id and amount
    request: Request
):
    _, user_id = require_role(request, {"customer"})
    
    # Get the request
    db_request = await database.fetch_one(
        "SELECT * FROM requests WHERE request_id = :request_id AND customer_id = :user_id",
        {"request_id": request_id, "user_id": user_id}
    )
    
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if db_request["status"] != "pending_payment":
        raise HTTPException(status_code=400, detail="Request already processed")
    
    # Update request status to confirmed
    await database.execute(
        """
        UPDATE requests 
        SET status = 'confirmed', 
            payment_id = :payment_id,
            paid_amount = :amount,
            paid_at = :paid_at
        WHERE request_id = :request_id
        """,
        {
            "payment_id": confirmation["payment_id"],
            "amount": confirmation["amount"],
            "paid_at": datetime.utcnow(),
            "request_id": request_id
        }
    )
    
    return {"status": "confirmed", "message": "Request confirmed successfully"}

    # Add to your backend - GET /requests/pending
@router.get("/requests/pending")
async def get_pending_requests(request: Request):
    """Get customer's pending requests (not yet approved)"""
    
    _, customer_id = require_role(request, {"customer"})
    
    rows = await database.fetch_all(
        """
        SELECT
            request_id,
            chef_id,
            status,
            created_at,
            price,
            summary
        FROM request
        WHERE customer_id = :customer_id
          AND status = 'pending'
        ORDER BY created_at DESC
        """,
        {"customer_id": customer_id},
    )
    
    results = []
    for row in rows:
        ingredients_rows = await database.fetch_all(
            "SELECT ingredient_name FROM request_ingredient WHERE request_id = :request_id",
            {"request_id": row["request_id"]},
        )
        equipment_rows = await database.fetch_all(
            "SELECT equipment_name FROM request_equipment WHERE request_id = :request_id",
            {"request_id": row["request_id"]},
        )
        
        results.append({
            **dict(row),
            "ingredients": [r["ingredient_name"] for r in ingredients_rows],
            "equipment": [r["equipment_name"] for r in equipment_rows],
        })
    
    return results