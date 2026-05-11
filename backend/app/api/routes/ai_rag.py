# ai_rag.py

from google import genai
import asyncio
import os

from app.db.session import database

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def embed_text(text: str):
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
    )
    return response.embeddings[0].values


# ── Chef search ────────────────────────────────────────────────────────────────

async def search_chefs_by_embedding(embedding, limit: int = 5):
    query = """
        SELECT
            chef_data.chef_id,
            "user".name,
            "user".description,
            chef_data.food_specialty,
            chef_data.embedding <=> :embedding AS distance
        FROM chef_data
        JOIN "user" ON chef_data.chef_id = "user".user_id
        ORDER BY distance ASC
        LIMIT :limit
    """
    return await database.fetch_all(query, {"embedding": str(embedding), "limit": limit})


# ── Review search ──────────────────────────────────────────────────────────────

async def search_reviews_by_embedding(embedding, limit: int = 10):
    query = """
        SELECT
            review.review_id,
            review.num_stars,
            review.review_content,
            review.created_at,
            reviewer.name  AS reviewer_name,
            reviewee.name  AS reviewee_name,
            review.embedding <=> :embedding AS distance
        FROM review
        JOIN "user" AS reviewer ON review.reviewer_id = reviewer.user_id
        JOIN "user" AS reviewee ON review.reviewee_id = reviewee.user_id
        ORDER BY distance ASC
        LIMIT :limit
    """
    return await database.fetch_all(query, {"embedding": str(embedding), "limit": limit})


# ── Request search ─────────────────────────────────────────────────────────────

async def search_requests_by_embedding(embedding, limit: int = 10):
    query = """
        SELECT
            request.request_id,
            request.summary,
            request.price,
            request.status,
            request.created_at,
            "user".name  AS customer_name,
            chef_user.name AS chef_name,
            array_agg(DISTINCT ri.ingredient_name) FILTER (WHERE ri.ingredient_name IS NOT NULL) AS ingredients,
            array_agg(DISTINCT re.equipment_name)  FILTER (WHERE re.equipment_name  IS NOT NULL) AS equipment,
            request.embedding <=> :embedding AS distance
        FROM request
        JOIN "user" ON request.customer_id = "user".user_id
        LEFT JOIN "user" AS chef_user ON request.chef_id = chef_user.user_id
        LEFT JOIN request_ingredient ri ON request.request_id = ri.request_id
        LEFT JOIN request_equipment  re ON request.request_id = re.request_id
        GROUP BY
            request.request_id,
            request.summary,
            request.price,
            request.status,
            request.created_at,
            "user".name,
            chef_user.name,
            distance
        ORDER BY distance ASC
        LIMIT :limit
    """
    return await database.fetch_all(query, {"embedding": str(embedding), "limit": limit})


# ── Formatters ─────────────────────────────────────────────────────────────────

def format_chef_context(chefs) -> str:
    if not chefs:
        return "No matching chefs found."
    return "\n\n".join(
        f"Chef: {c['name']}\n"
        f"Specialty: {c['food_specialty']}\n"
        f"Description: {c['description']}"
        for c in chefs
    )


def format_review_context(reviews) -> str:
    if not reviews:
        return "No relevant reviews found."
    return "\n\n".join(
        f"Review of {r['reviewee_name']} by {r['reviewer_name']} "
        f"({r['num_stars']}/5 stars, {r['created_at'].date()}):\n"
        f"{r['review_content']}"
        for r in reviews
    )


def format_request_context(requests) -> str:
    if not requests:
        return "No similar past requests found."
    return "\n\n".join(
        f"Request #{r['request_id']} by {r['customer_name']} "
        f"(status: {r['status']}, price: ${r['price']:.2f}):\n"
        f"Summary: {r['summary']}\n"
        f"Ingredients: {', '.join(r['ingredients'] or []) or 'none listed'}\n"
        f"Equipment: {', '.join(r['equipment'] or []) or 'none listed'}"
        for r in requests
    )


# ── Main RAG entry point ───────────────────────────────────────────────────────

async def get_chef_recommendations(request_text: str):
    # 1. Embed the query once, reuse for all three searches
    query_embedding = embed_text(request_text)

    # 2. Retrieve similar chefs, reviews, and requests in parallel
    chefs, reviews, requests = await asyncio.gather(
        search_chefs_by_embedding(query_embedding),
        search_reviews_by_embedding(query_embedding),
        search_requests_by_embedding(query_embedding),
    )

    # 3. Format context blocks
    chef_context    = format_chef_context(chefs)
    review_context  = format_review_context(reviews)
    request_context = format_request_context(requests)

    # 4. Ask Gemini with the enriched context
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"""
You are a chef recommendation system with access to a database of chefs, \
their past customer reviews, and historical cooking requests. \
Default to conversational behaviour if the user is not looking for chef recommendations.

User request:
{request_text}

--- Relevant chefs ---
{chef_context}

--- Relevant reviews ---
{review_context}

--- Similar past requests ---
{request_context}
        """,
    )

    return {
        "chefs":          [dict(c) for c in chefs],
        "reviews":        [dict(r) for r in reviews],
        "requests":       [dict(r) for r in requests],
        "recommendation": response.text,
    }