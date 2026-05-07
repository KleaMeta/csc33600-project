"""System and public utility routes."""

from fastapi import APIRouter

from app.db.session import database


router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health endpoint used by local development checks."""

    return {"status": "ok"}


@router.get("/api/chefs")
async def get_chefs():
    """Return all chef rows for the map page."""

    query = "SELECT * FROM chef"
    rows = await database.fetch_all(query)
    return [dict(row) for row in rows]
