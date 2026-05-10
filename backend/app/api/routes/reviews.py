from fastapi import APIRouter, Header, HTTPException
from app.db.session import database

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("/me")
async def get_my_reviews(
    x_user_role: str = Header(default=""),
    x_user_id: str = Header(default=""),
):
    if not x_user_id or not x_user_role:
        raise HTTPException(status_code=401, detail="Missing user information.")

    # convert once (important because DB uses varchar but still safer consistently)
    user_id = str(x_user_id)

    if x_user_role == "customer":
        # reviews I wrote
        query = """
            SELECT
                 r.review_id,
                r.num_stars,
                r.review_content,
                r.reviewer_id,
                u2.name AS reviewee_name,
                r.created_at
            FROM review r
            JOIN "user" u2 ON r.reviewee_id = u2.user_id
            WHERE r.reviewer_id = :user_id
            ORDER BY r.created_at DESC
            """

    elif x_user_role == "chef":
        # reviews about me
        query = """
            SELECT
                r.review_id,
                r.num_stars,
                r.review_content,
                u1.name AS reviewer_name,
                r.reviewee_id,
                r.created_at
        FROM review r
        JOIN "user" u1 ON r.reviewer_id = u1.user_id
        WHERE r.reviewee_id = :user_id
        ORDER BY r.created_at DESC
        """

    else:
        raise HTTPException(status_code=403, detail="Invalid user role.")

    return await database.fetch_all(query, {"user_id": user_id})