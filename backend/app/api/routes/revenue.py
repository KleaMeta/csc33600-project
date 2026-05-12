"""Revenue analytics endpoint for chefs."""

from fastapi import APIRouter, Request
from app.core.auth import require_role
from app.db.session import database

router = APIRouter()


@router.get("/revenue/summary")
async def get_revenue_summary(request: Request):
    """Return revenue summary for the logged-in chef."""

    _, chef_id = require_role(request, {"chef"})

    # Total earned (all accepted/completed requests)
    total = await database.fetch_val(
        """
        SELECT COALESCE(SUM(price), 0)
        FROM request
        WHERE chef_id = :chef_id
          AND status IN ('accepted', 'completed')
        """,
        {"chef_id": chef_id},
    )

    # This month
    this_month = await database.fetch_val(
        """
        SELECT COALESCE(SUM(price), 0)
        FROM request
        WHERE chef_id = :chef_id
          AND status IN ('accepted', 'completed')
          AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        """,
        {"chef_id": chef_id},
    )

    # Last month
    last_month = await database.fetch_val(
        """
        SELECT COALESCE(SUM(price), 0)
        FROM request
        WHERE chef_id = :chef_id
          AND status IN ('accepted', 'completed')
          AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        """,
        {"chef_id": chef_id},
    )

    # Total bookings
    total_bookings = await database.fetch_val(
        """
        SELECT COUNT(*)
        FROM request
        WHERE chef_id = :chef_id
          AND status IN ('accepted', 'completed')
        """,
        {"chef_id": chef_id},
    )

    # Pending bookings
    pending = await database.fetch_val(
        """
        SELECT COUNT(*)
        FROM request
        WHERE chef_id = :chef_id
          AND status = 'accepted'
        """,
        {"chef_id": chef_id},
    )

    # Monthly breakdown for chart (last 6 months)
    monthly_rows = await database.fetch_all(
        """
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
            DATE_TRUNC('month', created_at) AS month_date,
            COALESCE(SUM(price), 0) AS revenue,
            COUNT(*) AS bookings
        FROM request
        WHERE chef_id = :chef_id
          AND status IN ('accepted', 'completed')
          AND created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month_date ASC
        """,
        {"chef_id": chef_id},
    )

    # Recent bookings (last 5)
    recent_rows = await database.fetch_all(
        """
        SELECT
            request_id,
            customer_id,
            price,
            summary,
            status,
            created_at AS date
        FROM request
        WHERE chef_id = :chef_id
          AND status IN ('accepted', 'completed')
        ORDER BY created_at DESC
        LIMIT 5
        """,
        {"chef_id": chef_id},
    )

    month_over_month = 0
    if last_month and last_month > 0:
        month_over_month = round(((this_month - last_month) / last_month) * 100, 1)

    return {
        "total_revenue": float(total),
        "this_month": float(this_month),
        "last_month": float(last_month),
        "month_over_month": month_over_month,
        "total_bookings": int(total_bookings),
        "pending_bookings": int(pending),
        "monthly_chart": [
            {
                "month": row["month"],
                "revenue": float(row["revenue"]),
                "bookings": int(row["bookings"]),
            }
            for row in monthly_rows
        ],
        "recent_bookings": [
            {
                "request_id": row["request_id"],
                "customer_id": row["customer_id"],
                "price": float(row["price"]),
                "summary": row["summary"],
                "status": row["status"],
                "date": str(row["date"]),
            }
            for row in recent_rows
        ],
    }