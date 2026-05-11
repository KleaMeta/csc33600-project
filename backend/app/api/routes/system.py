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
    """Return all chefs, sponsored ones first, then alphabetical by name.

    If sponsor metadata is unavailable (for example, table mismatch in local DB),
    fall back to a plain chef list so the UI can still render all chefs.
    """

    sponsored_query = """
        SELECT
            chef.*,
            EXISTS (
                SELECT 1
                FROM chef_sponsorship
                WHERE chef_sponsorship.chef_id = chef.chef_id
                  AND NOW() BETWEEN chef_sponsorship.start_date
                                AND chef_sponsorship.end_date
            ) AS is_sponsored
        FROM chef
        ORDER BY is_sponsored DESC, chef.name ASC
    """

    try:
        rows = await database.fetch_all(sponsored_query)
        return [dict(row) for row in rows]
    except Exception:
        fallback_query = "SELECT * FROM chef ORDER BY name ASC"
        rows = await database.fetch_all(fallback_query)
        return [dict(row) for row in rows]

