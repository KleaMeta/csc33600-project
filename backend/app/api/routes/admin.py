"""Platform-wide admin revenue analytics."""

from fastapi import APIRouter, HTTPException, Request
from app.core.auth import require_role
from app.db.session import database

router = APIRouter()



ADMIN_SECRET = "cheffy2026"


def _require_admin(request: Request):
    secret = request.headers.get("X-Admin-Secret", "")
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden.")


@router.get("/admin/revenue/summary")
async def admin_revenue_summary(request: Request):
    """Return platform-wide revenue and commission summary."""

    _require_admin(request)

    # ── Overall totals ────────────────────────────────────────────────────
    totals = await database.fetch_one(
        """
        SELECT
            COALESCE(SUM(price), 0)      AS total_revenue,
            COALESCE(SUM(commission), 0) AS total_commission,
            COUNT(*)                     AS total_bookings
        FROM request
        WHERE status IN ('accepted', 'completed')
        """
    )

    # ── This month ────────────────────────────────────────────────────────
    this_month = await database.fetch_one(
        """
        SELECT
            COALESCE(SUM(price), 0)      AS revenue,
            COALESCE(SUM(commission), 0) AS commission,
            COUNT(*)                     AS bookings
        FROM request
        WHERE status IN ('accepted', 'completed')
          AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        """
    )

    # ── Last month ────────────────────────────────────────────────────────
    last_month = await database.fetch_one(
        """
        SELECT
            COALESCE(SUM(price), 0)      AS revenue,
            COALESCE(SUM(commission), 0) AS commission,
            COUNT(*)                     AS bookings
        FROM request
        WHERE status IN ('accepted', 'completed')
          AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        """
    )

    # ── Pending count ─────────────────────────────────────────────────────
    pending = await database.fetch_val(
        "SELECT COUNT(*) FROM request WHERE status = 'pending'"
    )

    # ── Active chefs (chefs with at least 1 accepted/completed booking) ───
    active_chefs = await database.fetch_val(
        """
        SELECT COUNT(DISTINCT chef_id)
        FROM request
        WHERE status IN ('accepted', 'completed')
          AND chef_id IS NOT NULL
        """
    )

    # ── Total registered chefs ────────────────────────────────────────────
    total_chefs = await database.fetch_val(
        "SELECT COUNT(*) FROM chef_data"
    )

    # ── Monthly breakdown — last 6 months ─────────────────────────────────
    monthly_rows = await database.fetch_all(
        """
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
            DATE_TRUNC('month', created_at)                 AS month_date,
            COALESCE(SUM(price), 0)                         AS revenue,
            COALESCE(SUM(commission), 0)                    AS commission,
            COUNT(*)                                        AS bookings,
            COUNT(*) FILTER (WHERE status = 'completed')    AS completed,
            COUNT(*) FILTER (WHERE status = 'accepted')     AS active
        FROM request
        WHERE status IN ('accepted', 'completed')
          AND created_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month_date ASC
        """
    )

    # ── Also fetch last-period monthly for comparison ─────────────────────
    last_period_rows = await database.fetch_all(
        """
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
            DATE_TRUNC('month', created_at)                 AS month_date,
            COALESCE(SUM(price), 0)                         AS revenue,
            COALESCE(SUM(commission), 0)                    AS commission
        FROM request
        WHERE status IN ('accepted', 'completed')
          AND created_at >= CURRENT_DATE - INTERVAL '12 months'
          AND created_at < CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month_date ASC
        """
    )

    # ── Top chefs by revenue ──────────────────────────────────────────────
    top_chefs = await database.fetch_all(
        """
        SELECT
            u.name                        AS name,
            r.chef_id                     AS chef_id,
            COALESCE(SUM(r.price), 0)     AS revenue,
            COALESCE(SUM(r.commission),0) AS commission,
            COUNT(*)                      AS bookings,
            ROUND(AVG(rv.num_stars), 1)   AS avg_rating
        FROM request r
        JOIN "user" u ON r.chef_id = u.user_id
        LEFT JOIN review rv ON rv.reviewee_id = r.chef_id
        WHERE r.status IN ('accepted', 'completed')
          AND r.chef_id IS NOT NULL
        GROUP BY r.chef_id, u.name
        ORDER BY revenue DESC
        LIMIT 6
        """
    )

    # ── Revenue by status (for donut) ─────────────────────────────────────
    by_status = await database.fetch_all(
        """
        SELECT
            status,
            COALESCE(SUM(price), 0) AS revenue,
            COUNT(*)                AS count
        FROM request
        WHERE status IN ('accepted', 'completed', 'pending')
        GROUP BY status
        """
    )

    # ── MoM calculation ───────────────────────────────────────────────────
    this_rev  = float(this_month["revenue"])
    last_rev  = float(last_month["revenue"])
    mom = round(((this_rev - last_rev) / last_rev) * 100, 1) if last_rev > 0 else 0

    this_com  = float(this_month["commission"])
    last_com  = float(last_month["commission"])
    com_mom = round(((this_com - last_com) / last_com) * 100, 1) if last_com > 0 else 0

    return {
        "totals": {
            "revenue":    float(totals["total_revenue"]),
            "commission": float(totals["total_commission"]),
            "bookings":   int(totals["total_bookings"]),
            "pending":    int(pending),
            "active_chefs": int(active_chefs),
            "total_chefs":  int(total_chefs),
        },
        "this_month": {
            "revenue":    float(this_month["revenue"]),
            "commission": float(this_month["commission"]),
            "bookings":   int(this_month["bookings"]),
        },
        "last_month": {
            "revenue":    float(last_month["revenue"]),
            "commission": float(last_month["commission"]),
            "bookings":   int(last_month["bookings"]),
        },
        "mom": {
            "revenue":    mom,
            "commission": com_mom,
        },
        "monthly_chart": [
            {
                "month":      row["month"],
                "revenue":    float(row["revenue"]),
                "commission": float(row["commission"]),
                "bookings":   int(row["bookings"]),
                "completed":  int(row["completed"]),
                "active":     int(row["active"]),
            }
            for row in monthly_rows
        ],
        "last_period_chart": [
            {
                "month":      row["month"],
                "revenue":    float(row["revenue"]),
                "commission": float(row["commission"]),
            }
            for row in last_period_rows
        ],
        "top_chefs": [
            {
                "name":       row["name"],
                "chef_id":    row["chef_id"],
                "revenue":    float(row["revenue"]),
                "commission": float(row["commission"]),
                "bookings":   int(row["bookings"]),
                "avg_rating": float(row["avg_rating"]) if row["avg_rating"] else None,
            }
            for row in top_chefs
        ],
        "by_status": [
            {
                "status":  row["status"],
                "revenue": float(row["revenue"]),
                "count":   int(row["count"]),
            }
            for row in by_status
        ],
    }