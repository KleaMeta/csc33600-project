"""Platform-wide developer/admin revenue analytics."""

from fastapi import APIRouter, Request
from app.core.auth import require_role
from app.db.session import database

router = APIRouter()


@router.get("/admin/revenue/summary")
async def admin_revenue_summary(request: Request):
    """Return platform-wide developer revenue summary for admin users."""
    require_role(request, {"admin"})

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

    sponsorship_totals = await database.fetch_one(
        """
        SELECT
            COALESCE(SUM(price), 0) AS total_sponsorship_revenue,
            COUNT(*) AS total_sponsorship_count
        FROM chef_sponsorship
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

    this_month_sponsorship = await database.fetch_val(
        """
        SELECT COALESCE(SUM(price), 0)
        FROM chef_sponsorship
        WHERE DATE_TRUNC('month', purchase_timestamp) = DATE_TRUNC('month', CURRENT_DATE)
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

    last_month_sponsorship = await database.fetch_val(
        """
        SELECT COALESCE(SUM(price), 0)
        FROM chef_sponsorship
        WHERE DATE_TRUNC('month', purchase_timestamp) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
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

    sponsorship_monthly_rows = await database.fetch_all(
        """
        SELECT
            DATE_TRUNC('month', purchase_timestamp) AS month_date,
            COALESCE(SUM(price), 0) AS sponsorship_revenue,
            COUNT(*) AS sponsorship_count
        FROM chef_sponsorship
        WHERE purchase_timestamp >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', purchase_timestamp)
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

    total_sponsorship = float(sponsorship_totals["total_sponsorship_revenue"])
    this_sponsorship = float(this_month_sponsorship)
    last_sponsorship = float(last_month_sponsorship)
    sponsorship_mom = round(((this_sponsorship - last_sponsorship) / last_sponsorship) * 100, 1) if last_sponsorship > 0 else 0

    sponsorship_by_month = {
        row["month_date"]: {
            "sponsorship_revenue": float(row["sponsorship_revenue"]),
            "sponsorship_count": int(row["sponsorship_count"]),
        }
        for row in sponsorship_monthly_rows
    }

    return {
        "totals": {
            "revenue":    float(totals["total_revenue"]),
            "commission": float(totals["total_commission"]),
            "sponsorship_revenue": total_sponsorship,
            "developer_revenue": float(totals["total_commission"]) + total_sponsorship,
            "sponsorship_count": int(sponsorship_totals["total_sponsorship_count"]),
            "bookings":   int(totals["total_bookings"]),
            "pending":    int(pending),
            "active_chefs": int(active_chefs),
            "total_chefs":  int(total_chefs),
        },
        "this_month": {
            "revenue":    float(this_month["revenue"]),
            "commission": float(this_month["commission"]),
            "sponsorship_revenue": this_sponsorship,
            "developer_revenue": float(this_month["commission"]) + this_sponsorship,
            "bookings":   int(this_month["bookings"]),
        },
        "last_month": {
            "revenue":    float(last_month["revenue"]),
            "commission": float(last_month["commission"]),
            "sponsorship_revenue": last_sponsorship,
            "developer_revenue": float(last_month["commission"]) + last_sponsorship,
            "bookings":   int(last_month["bookings"]),
        },
        "mom": {
            "revenue":    mom,
            "commission": com_mom,
            "sponsorship_revenue": sponsorship_mom,
            "developer_revenue": round(
                (
                    (
                        float(this_month["commission"]) + this_sponsorship
                        - (float(last_month["commission"]) + last_sponsorship)
                    )
                    / (float(last_month["commission"]) + last_sponsorship)
                )
                * 100,
                1,
            ) if (float(last_month["commission"]) + last_sponsorship) > 0 else 0,
        },
        "monthly_chart": [
            {
                "month":      row["month"],
                "revenue":    float(row["revenue"]),
                "commission": float(row["commission"]),
                "sponsorship_revenue": sponsorship_by_month.get(row["month_date"], {}).get("sponsorship_revenue", 0.0),
                "developer_revenue": float(row["commission"]) + sponsorship_by_month.get(row["month_date"], {}).get("sponsorship_revenue", 0.0),
                "sponsorship_count": sponsorship_by_month.get(row["month_date"], {}).get("sponsorship_count", 0),
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


@router.get("/admin/revenue/commission-transactions")
async def admin_commission_transactions(request: Request):
    """Return accepted/completed request rows that make up commission totals."""
    require_role(request, {"admin"})

    rows = await database.fetch_all(
        """
        SELECT
            r.request_id,
            r.customer_id,
            customer_u.name AS customer_name,
            r.chef_id,
            chef_u.name AS chef_name,
            r.status,
            r.created_at,
            r.price,
            r.commission,
            r.summary
        FROM request r
        LEFT JOIN "user" chef_u ON chef_u.user_id = r.chef_id
        LEFT JOIN "user" customer_u ON customer_u.user_id = r.customer_id
        WHERE r.status IN ('accepted', 'completed')
        ORDER BY r.created_at DESC, r.request_id DESC
        """
    )

    return {
        "count": len(rows),
        "transactions": [
            {
                "request_id": row["request_id"],
                "customer_id": row["customer_id"],
                "customer_name": row["customer_name"],
                "chef_id": row["chef_id"],
                "chef_name": row["chef_name"],
                "status": row["status"],
                "created_at": str(row["created_at"]),
                "price": float(row["price"] or 0),
                "commission": float(row["commission"] or 0),
                "summary": row["summary"],
            }
            for row in rows
        ],
    }


@router.get("/admin/revenue/sponsorship-transactions")
async def admin_sponsorship_transactions(request: Request):
    """Return sponsorship rows that make up sponsorship totals."""
    require_role(request, {"admin"})

    rows = await database.fetch_all(
        """
        SELECT
            s.sponsorship_id,
            s.chef_id,
            u.name AS chef_name,
            s.price,
            s.purchase_timestamp,
            s.start_date,
            s.end_date,
            s.payment_info_used_id
        FROM chef_sponsorship s
        LEFT JOIN "user" u ON u.user_id = s.chef_id
        ORDER BY s.purchase_timestamp DESC, s.sponsorship_id DESC
        """
    )

    return {
        "count": len(rows),
        "transactions": [
            {
                "sponsorship_id": row["sponsorship_id"],
                "chef_id": row["chef_id"],
                "chef_name": row["chef_name"],
                "price": float(row["price"] or 0),
                "purchase_timestamp": str(row["purchase_timestamp"]),
                "start_date": str(row["start_date"]),
                "end_date": str(row["end_date"]),
                "payment_info_used_id": row["payment_info_used_id"],
            }
            for row in rows
        ],
    }
