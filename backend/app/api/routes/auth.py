"""Authentication routes for chef and customer logins."""

from fastapi import APIRouter, HTTPException

from app.db.session import database
from app.schemas.auth import LoginRequest


router = APIRouter()


@router.post("/chef-login")
async def chef_login(login_data: LoginRequest):
    """Validate chef credentials and return role payload."""

    chef = await database.fetch_one(
        """
        SELECT
            "user".user_id AS chef_id,
            "user".name,
            "user".email,
            "user".password_hash
        FROM "user"
        JOIN chef_data ON chef_data.chef_id = "user".user_id
        WHERE "user".email = :email
          AND "user".type_of_user = 'chef'
        """,
        {"email": login_data.email},
    )

    if not chef or chef["password_hash"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "message": "Login successful.",
        "role": "chef",
        "user_id": chef["chef_id"],
        "name": chef["name"],
        "email": chef["email"],
    }


@router.post("/customer-login")
async def customer_login(login_data: LoginRequest):
    """Validate customer credentials and return role payload."""

    customer = await database.fetch_one(
        """
        SELECT
            user_id AS customer_id,
            name,
            email,
            password_hash
        FROM "user"
        WHERE email = :email
          AND type_of_user = 'customer'
        """,
        {"email": login_data.email},
    )

    if not customer or customer["password_hash"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "message": "Login successful.",
        "role": "customer",
        "user_id": customer["customer_id"],
        "name": customer["name"],
        "email": customer["email"],
    }


@router.post("/admin-login")
async def admin_login(login_data: LoginRequest):
    """Validate admin credentials and return role payload."""

    admin_user = await database.fetch_one(
        """
        SELECT
            user_id AS admin_id,
            name,
            email,
            password_hash
        FROM "user"
        WHERE email = :email
          AND type_of_user = 'admin'
        """,
        {"email": login_data.email},
    )

    if not admin_user or admin_user["password_hash"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "message": "Login successful.",
        "role": "admin",
        "user_id": admin_user["admin_id"],
        "name": admin_user["name"],
        "email": admin_user["email"],
    }
