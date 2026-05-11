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

    selected_chef_id = request_data.chef_id.strip() if request_data.chef_id else None

    try:
        if selected_chef_id:
            chef_exists = await database.fetch_val(
                "SELECT COUNT(*) FROM chef_data WHERE chef_id = :chef_id",
                {"chef_id": selected_chef_id},
            )
            if not chef_exists:
                raise HTTPException(status_code=400, detail="Selected chef does not exist.")

        max_id = await database.fetch_val("SELECT COALESCE(MAX(request_id), 0) FROM request")
        request_id = max_id + 1

        await database.execute(
            """
            INSERT INTO request (request_id, customer_id, chef_id, status, created_at, price, summary)
            VALUES (:request_id, :customer_id, :chef_id, 'pending', :created_at, :price, :summary)
            """,
            {
                "request_id": request_id,
                "customer_id": customer_id,
                "chef_id": selected_chef_id,
                "price": float(request_data.price),
                "created_at": datetime.combine(request_data.date, time.min),
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

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc

    return {
        "message": "Request received.",
        "customer_id": customer_id,
        "request_id": request_id,
    }


@router.get("/requests/my")
async def get_my_requests(request: Request):
    """Return all requests submitted by the logged-in customer."""

    _, customer_id = require_role(request, {"customer"})

    rows = await database.fetch_all(
        """
        SELECT
            request_id,
            customer_id,
            chef_id,
            status,
            created_at AS date,
            price,
            summary
        FROM request
        WHERE customer_id = :customer_id
        ORDER BY created_at DESC, request_id DESC
        """,
        {"customer_id": customer_id},
    )

    results = []
    for row in rows:
        ingredients_rows = await database.fetch_all(
            """
            SELECT ingredient_name
            FROM request_ingredient
            WHERE request_id = :request_id
            ORDER BY ingredient_name ASC
            """,
            {"request_id": row["request_id"]},
        )
        equipment_rows = await database.fetch_all(
            """
            SELECT equipment_name
            FROM request_equipment
            WHERE request_id = :request_id
            ORDER BY equipment_name ASC
            """,
            {"request_id": row["request_id"]},
        )

        results.append(
            {
                **dict(row),
                "ingredients": [r["ingredient_name"] for r in ingredients_rows],
                "equipment": [r["equipment_name"] for r in equipment_rows],
            }
        )

    return results


@router.get("/requests/open")
async def get_open_requests(request: Request):
    """Return open requests visible to the logged-in chef."""

    _, chef_id = require_role(request, {"chef"})

    rows = await database.fetch_all(
        """
        SELECT
            request_id,
            customer_id,
            chef_id,
            status,
            created_at AS date,
            price,
            summary
        FROM request
        WHERE status = 'pending'
          AND (chef_id IS NULL OR chef_id = :chef_id)
        ORDER BY created_at ASC, request_id ASC
        """,
        {"chef_id": chef_id},
    )

    results = []
    for row in rows:
        ingredients_rows = await database.fetch_all(
            """
            SELECT ingredient_name
            FROM request_ingredient
            WHERE request_id = :request_id
            ORDER BY ingredient_name ASC
            """,
            {"request_id": row["request_id"]},
        )
        equipment_rows = await database.fetch_all(
            """
            SELECT equipment_name
            FROM request_equipment
            WHERE request_id = :request_id
            ORDER BY equipment_name ASC
            """,
            {"request_id": row["request_id"]},
        )

        results.append(
            {
                **dict(row),
                "accepted": False,
                "ingredients": [r["ingredient_name"] for r in ingredients_rows],
                "equipment": [r["equipment_name"] for r in equipment_rows],
            }
        )

    return results


@router.get("/requests/bookings")
async def get_bookings(request: Request):
    """Return accepted bookings for the logged-in chef or customer."""

    role = request.headers.get("X-User-Role", "")
    user_id = request.headers.get("X-User-Id", "")

    if not role or not user_id:
        raise HTTPException(status_code=401, detail="Authentication required.")

    if role == "chef":
        query = """
            SELECT
                request_id,
                customer_id,
                chef_id,
                status,
                created_at AS date,
                price,
                summary
            FROM request
            WHERE chef_id = :user_id
              AND status = 'accepted'
            ORDER BY created_at DESC
        """
    elif role == "customer":
        query = """
            SELECT
                request_id,
                customer_id,
                chef_id,
                status,
                created_at AS date,
                price,
                summary
            FROM request
            WHERE customer_id = :user_id
              AND status = 'accepted'
            ORDER BY created_at DESC
        """
    else:
        raise HTTPException(status_code=403, detail="Access denied.")

    rows = await database.fetch_all(query, {"user_id": user_id})

    results = []
    for row in rows:
        ingredients_rows = await database.fetch_all(
            """
            SELECT ingredient_name
            FROM request_ingredient
            WHERE request_id = :request_id
            """,
            {"request_id": row["request_id"]},
        )
        equipment_rows = await database.fetch_all(
            """
            SELECT equipment_name
            FROM request_equipment
            WHERE request_id = :request_id
            """,
            {"request_id": row["request_id"]},
        )

        results.append({
            **dict(row),
            "ingredients": [r["ingredient_name"] for r in ingredients_rows],
            "equipment": [r["equipment_name"] for r in equipment_rows],
        })

    return results


@router.patch("/requests/{request_id}/approve")
async def approve_request(request_id: int, request: Request):
    """Approve a request as the logged-in chef."""

    _, chef_id = require_role(request, {"chef"})

    try:
        result = await database.execute(
            """
            UPDATE request
            SET chef_id = :chef_id, status = 'accepted'
            WHERE request_id = :request_id
              AND status = 'pending'
              AND (chef_id IS NULL OR chef_id = :chef_id)
            """,
            {"chef_id": chef_id, "request_id": request_id},
        )

        if result == 0:
            existing = await database.fetch_one(
                "SELECT request_id FROM request WHERE request_id = :request_id",
                {"request_id": request_id},
            )
            if not existing:
                raise HTTPException(status_code=404, detail="Request not found.")
            raise HTTPException(
                status_code=403,
                detail="This request is assigned to another chef or is already closed.",
            )

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
            "request_id": row["request_id"],
            "chef_id": row["chef_id"],
            "status": row["status"],
            "date": row["created_at"].strftime("%Y-%m-%d") if row["created_at"] else None,
            "price": float(row["price"]) if row["price"] else 0,
            "summary": row["summary"],
            "ingredients": [r["ingredient_name"] for r in ingredients_rows],
            "equipment": [r["equipment_name"] for r in equipment_rows],
        })
    
    return results


@router.patch("/requests/{request_id}/reject")
async def reject_request(request_id: int, request: Request):
    _, chef_id = require_role(request, {"chef"})

    result = await database.execute(
        """
        UPDATE request
        SET status = 'rejected'
        WHERE request_id = :request_id
          AND status = 'pending'
          AND (chef_id IS NULL OR chef_id = :chef_id)
        """,
        {"request_id": request_id, "chef_id": chef_id},
    )

    if result == 0:
        raise HTTPException(status_code=404, detail="Request not found or already processed.")

    return {"message": "Request rejected."}


@router.patch("/requests/{request_id}/cancel")
async def cancel_request(request_id: int, request: Request):
    """Cancel/complete a booking. Chefs mark it completed; customers cancel a pending request."""

    role = request.headers.get("X-User-Role", "")
    user_id = request.headers.get("X-User-Id", "")

    if not role or not user_id:
        raise HTTPException(status_code=401, detail="Authentication required.")

    if role == "chef":
        # Chef marks an accepted booking as completed
        result = await database.execute(
            """
            UPDATE request
            SET status = 'completed'
            WHERE request_id = :request_id
              AND chef_id = :user_id
              AND status = 'accepted'
            """,
            {"request_id": request_id, "user_id": user_id},
        )
        if result == 0:
            raise HTTPException(status_code=404, detail="Booking not found or not yours.")
        return {"message": "Booking completed."}

    elif role == "customer":
        result = await database.execute(
            """
            UPDATE request
            SET status = 'rejected'
            WHERE request_id = :request_id
            AND customer_id = :user_id
            AND status IN ('pending', 'accepted')
            """,
            {"request_id": request_id, "user_id": user_id},
        )
        if result == 0:
            raise HTTPException(status_code=404, detail="Request not found or cannot be cancelled.")
        return {"message": "Request cancelled."}

    else:
        raise HTTPException(status_code=403, detail="Access denied.")

@router.get("/customers/bookings")
async def get_customer_bookings(request: Request):
    """Get customer's confirmed bookings with chef names"""
    
    _, customer_id = require_role(request, {"customer"})
    
    rows = await database.fetch_all(
        """
        SELECT 
            r.request_id,
            r.chef_id,
            r.status,
            r.created_at,
            r.price,
            r.summary,
            u.name as chef_name
        FROM request r
        LEFT JOIN "user" u ON r.chef_id = u.user_id
        WHERE r.customer_id = :customer_id
          AND r.status = 'accepted'
        ORDER BY r.created_at DESC
        """,
        {"customer_id": customer_id},
    )
    
    results = []
    for row in rows:
        # Get ingredients
        ingredients_rows = await database.fetch_all(
            "SELECT ingredient_name FROM request_ingredient WHERE request_id = :request_id",
            {"request_id": row["request_id"]},
        )
        
        # Get equipment
        equipment_rows = await database.fetch_all(
            "SELECT equipment_name FROM request_equipment WHERE request_id = :request_id",
            {"request_id": row["request_id"]},
        )
        
        results.append({
            "request_id": row["request_id"],
            "chef_id": row["chef_id"],
            "chef_name": row["chef_name"] or "Any Chef",
            "status": row["status"],
            "date": row["created_at"].strftime("%Y-%m-%d") if row["created_at"] else None,
            "price": float(row["price"]) if row["price"] else 0,
            "summary": row["summary"],
            "ingredients": [r["ingredient_name"] for r in ingredients_rows],
            "equipment": [r["equipment_name"] for r in equipment_rows],
        })
    
    return results