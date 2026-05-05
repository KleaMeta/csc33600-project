"""Backend app for the hire-a-chef form."""

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


from app.db.session import database
from app.schemas.request import HireChefRequest

load_dotenv()

app = FastAPI(title="Cheffy Backend")
REPO_ROOT = Path(__file__).resolve().parents[2]
IMAGES_DIR = REPO_ROOT / "database" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/chefs")
async def get_chefs():
    query = "SELECT * FROM chef"
    rows = await database.fetch_all(query)
    return [dict(row) for row in rows]

@app.post("/requests")
async def create_request(request_data: HireChefRequest):
    assumed_customer_id = os.getenv("ASSUMED_CUSTOMER_ID")

    try:
        # Get next request_id
        max_id = await database.fetch_val("SELECT COALESCE(MAX(request_id), 0) FROM request")
        request_id = max_id + 1

        # Insert main request
        await database.execute(
            """
            INSERT INTO request (request_id, customer_id, chef_id, accepted, price, date, summary)
            VALUES (:request_id, :customer_id, NULL, FALSE, :price, :date, :summary)
            """,
            {
                "request_id": request_id,
                "customer_id": assumed_customer_id,
                "price": float(request_data.price),
                "date": request_data.date,
                "summary": request_data.summary,
            }
        )

        # Insert ingredients
        for ingredient_name in request_data.ingredients:
            await database.execute(
                "INSERT INTO request_ingredient (request_id, ingredient_name) VALUES (:request_id, :ingredient_name)",
                {"request_id": request_id, "ingredient_name": ingredient_name}
            )

        # Insert equipment
        for equipment_name in request_data.equipment:
            await database.execute(
                "INSERT INTO request_equipment (request_id, equipment_name) VALUES (:request_id, :equipment_name)",
                {"request_id": request_id, "equipment_name": equipment_name}
            )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc

    return {
        "message": "Request received.",
        "customer_id": assumed_customer_id,
        "request_id": request_id,
    }

@app.patch("/requests/{request_id}/approve")
async def approve_request(request_id: int):
    assumed_chef_id = os.getenv("ASSUMED_CHEF_ID", "chef_demo")

    try:
        result = await database.execute(
            """
            UPDATE request SET chef_id = :chef_id, accepted = TRUE
            WHERE request_id = :request_id
            """,
            {"chef_id": assumed_chef_id, "request_id": request_id}
        )

        if result == 0:
            raise HTTPException(status_code=404, detail="Request not found.")

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}") from exc

    return {
        "message": "Request approved.",
        "request_id": request_id,
        "chef_id": assumed_chef_id,
        "accepted": True,
    }
