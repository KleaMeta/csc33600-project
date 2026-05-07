"""Authentication routes for chef and customer logins."""

from fastapi import APIRouter, HTTPException

from app.db.session import database
from app.schemas.auth import LoginRequest


router = APIRouter()


@router.post("/chef-login")
async def chef_login(login_data: LoginRequest):
    """Validate chef credentials and return role payload."""

    chef = await database.fetch_one(
        "SELECT chef_id, name, email, password FROM chef WHERE email = :email",
        {"email": login_data.email},
    )

    if not chef or chef["password"] != login_data.password:
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
        "SELECT customer_id, name, email, password FROM customer WHERE email = :email",
        {"email": login_data.email},
    )

    if not customer or customer["password"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "message": "Login successful.",
        "role": "customer",
        "user_id": customer["customer_id"],
        "name": customer["name"],
        "email": customer["email"],
    }
