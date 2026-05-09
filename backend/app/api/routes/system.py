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

    # `is_sponsored` flips to TRUE when the chef has at least one active sponsor row
    # (NOW() falls between start_date and end_date). EXISTS keeps the chef row unique.
    sponsored_query = """
        SELECT
            chef.*,
            EXISTS (
                SELECT 1 FROM sponsor
                WHERE sponsor.chef_id = chef.chef_id
                  AND NOW() BETWEEN sponsor.start_date AND sponsor.end_date
            ) AS is_sponsored
        FROM chef
        ORDER BY is_sponsored DESC, chef.name ASC
    """

    try:
        rows = await database.fetch_all(sponsored_query)
        return [dict(row) for row in rows]
    except Exception:
        # Sponsor ranking is optional metadata. If it fails, still return all chefs.
        fallback_query = "SELECT * FROM chef ORDER BY name ASC"
        rows = await database.fetch_all(fallback_query)
        return [dict(row) for row in rows]
