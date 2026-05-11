from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from app.db.session import database
from app.core.auth import require_role

router = APIRouter(prefix="/chef", tags=["chef"])

class SponsorshipCreate(BaseModel):
    price: float
    duration_days: int
    payment_info_id: int


class SponsorshipResponse(BaseModel):
    sponsorship_id: int
    price: float
    purchase_timestamp: datetime
    start_date: datetime
    end_date: datetime
    payment_info_used_id: int


@router.get("/sponsorships")
async def get_chef_sponsorships(request: Request):
    """Get all sponsorships for the logged-in chef"""
    
    _, chef_id = require_role(request, {"chef"})
    
    rows = await database.fetch_all(
        """
        SELECT 
            sponsorship_id,
            price,
            purchase_timestamp,
            start_date,
            end_date,
            payment_info_used_id
        FROM chef_sponsorship
        WHERE chef_id = :chef_id
        ORDER BY purchase_timestamp DESC
        """,
        {"chef_id": chef_id},
    )
    
    return [dict(row) for row in rows]


@router.post("/sponsorships")
async def create_sponsorship(sponsorship_data: SponsorshipCreate, request: Request):
    """Purchase a new sponsorship"""
    
    _, chef_id = require_role(request, {"chef"})
    
    payment_info = await database.fetch_one(
        """
        SELECT payment_id 
        FROM payment_info 
        WHERE payment_id = :payment_id 
          AND user_id = :user_id
          AND status = 'active'
        """,
        {
            "payment_id": sponsorship_data.payment_info_id,
            "user_id": chef_id,
        },
    )
    
    if not payment_info:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    max_id = await database.fetch_val(
        "SELECT COALESCE(MAX(sponsorship_id), 0) FROM chef_sponsorship"
    )
    sponsorship_id = max_id + 1
    
    now = datetime.utcnow()
    start_date = now
    end_date = now + timedelta(days=sponsorship_data.duration_days)
    
    await database.execute(
        """
        INSERT INTO chef_sponsorship (
            sponsorship_id, chef_id, price, purchase_timestamp,
            start_date, end_date, payment_info_used_id
        ) VALUES (
            :sponsorship_id, :chef_id, :price, :purchase_timestamp,
            :start_date, :end_date, :payment_info_used_id
        )
        """,
        {
            "sponsorship_id": sponsorship_id,
            "chef_id": chef_id,
            "price": sponsorship_data.price,
            "purchase_timestamp": now,
            "start_date": start_date,
            "end_date": end_date,
            "payment_info_used_id": sponsorship_data.payment_info_id,
        }
    )
    
    await database.execute(
        """
        UPDATE chef_data
        SET sponsor_score = COALESCE(sponsor_score, 0) + :score_boost
        WHERE chef_id = :chef_id
        """,
        {
            "chef_id": chef_id,
            "score_boost": sponsorship_data.price / 100, 
        }
    )
    
    return {
        "sponsorship_id": sponsorship_id,
        "price": sponsorship_data.price,
        "purchase_timestamp": now,
        "start_date": start_date,
        "end_date": end_date,
        "payment_info_used_id": sponsorship_data.payment_info_id,
    }


@router.get("/sponsorships/active")
async def get_active_sponsorship(request: Request):
    """Get currently active sponsorship for the logged-in chef"""
    
    _, chef_id = require_role(request, {"chef"})
    
    now = datetime.utcnow()
    
    row = await database.fetch_one(
        """
        SELECT 
            sponsorship_id,
            price,
            purchase_timestamp,
            start_date,
            end_date,
            payment_info_used_id
        FROM chef_sponsorship
        WHERE chef_id = :chef_id
          AND start_date <= :now
          AND end_date >= :now
        ORDER BY end_date ASC
        LIMIT 1
        """,
        {"chef_id": chef_id, "now": now},
    )
    
    return dict(row) if row else None

@router.delete("/sponsorships/{sponsorship_id}")
async def cancel_sponsorship(sponsorship_id: int, request: Request):
    """Cancel an active sponsorship and refund remaining days"""
    
    _, chef_id = require_role(request, {"chef"})
    
    sponsorship = await database.fetch_one(
        """
        SELECT * FROM chef_sponsorship 
        WHERE sponsorship_id = :sponsorship_id 
          AND chef_id = :chef_id
        """,
        {"sponsorship_id": sponsorship_id, "chef_id": chef_id},
    )
    
    if not sponsorship:
        raise HTTPException(status_code=404, detail="Sponsorship not found")
    
    now = datetime.utcnow()
    end_date = sponsorship["end_date"]
    
    if end_date < now:
        raise HTTPException(status_code=400, detail="Cannot cancel expired sponsorship")
    
    total_days = (end_date - sponsorship["start_date"]).days
    days_remaining = (end_date - now).days
    refund_amount = (sponsorship["price"] / total_days) * days_remaining if total_days > 0 else 0
    
    await database.execute(
        """
        DELETE FROM chef_sponsorship
        WHERE sponsorship_id = :sponsorship_id
        """,
        {"sponsorship_id": sponsorship_id},
    )
    
    await database.execute(
        """
        UPDATE chef_data
        SET sponsor_score = COALESCE(sponsor_score, 0) - :score_removal
        WHERE chef_id = :chef_id
        """,
        {
            "chef_id": chef_id,
            "score_removal": sponsorship["price"] / 100,
        }
    )
    
    return {
        "message": "Sponsorship cancelled",
        "refund_amount": refund_amount,
        "days_remaining": days_remaining
    }