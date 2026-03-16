"""Minimal backend app for the hire-a-chef form."""

import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import get_supabase_client
from app.schemas.request import HireChefRequest


load_dotenv()

app = FastAPI(title="GlobalRatatouille Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_or_create_lookup_id(supabase, table_name, id_column, name_column, value):
    """Return the ID for a named lookup value, inserting it first if needed."""

    existing_row = (
        supabase.table(table_name)
        .select(id_column)
        .eq(name_column, value)
        .limit(1)
        .execute()
    )

    if existing_row.data:
        return existing_row.data[0][id_column]

    next_id = get_next_integer_id(supabase, table_name, id_column)
    inserted_row = (
        supabase.table(table_name)
        .insert({id_column: next_id, name_column: value})
        .execute()
    )

    if not inserted_row.data:
        raise RuntimeError(f"Could not insert into {table_name}.")

    return inserted_row.data[0][id_column]


def get_next_integer_id(supabase, table_name, id_column):
    """Return the next integer ID for a table that is not auto-incrementing."""

    latest_row = (
        supabase.table(table_name)
        .select(id_column)
        .order(id_column, desc=True)
        .limit(1)
        .execute()
    )

    if not latest_row.data:
        return 1

    return latest_row.data[0][id_column] + 1

@app.get("/health")
def health_check():
    """Simple route for confirming the backend is running."""

    return {"status": "ok"}


@app.post("/requests")
def create_request(request_data: HireChefRequest):
    """Receive a hire-a-chef submission from the UI.

    For now this route:
    - accepts the submitted form data
    - attaches an assumed customer_id
    - prepares the table payloads
    """

    assumed_customer_id = os.getenv("ASSUMED_CUSTOMER_ID")

    # This row matches the request table described in the README schema.
    # `chef_id` starts as null because the request has not been assigned yet.
    # `accepted` starts as false because no chef has approved it yet.
    request_row = {
        "request_id": None,
        "customer_id": assumed_customer_id,
        "chef_id": None,
        "accepted": False,
        "price": float(request_data.price),
        "date": request_data.date,
        "description": request_data.summary,
    }

    # Keep these lists separate so they are easy to map into join tables.
    ingredient_rows = request_data.ingredients
    equipment_rows = request_data.equipment

    try:
        # Create the client once for all DB operations in this request.
        supabase = get_supabase_client()

        request_row["request_id"] = get_next_integer_id(
            supabase=supabase,
            table_name="request",
            id_column="request_id",
        )

        # Insert the main request and read back its generated request_id.
        request_result = supabase.table("request").insert(request_row).execute()

        if not request_result.data:
            raise RuntimeError("Request insert did not return any data.")

        request_id = request_result.data[0]["request_id"]

        # Ensure each ingredient exists in the ingredients lookup table, then
        # connect it to the request through the join table.
        for ingredient_name in ingredient_rows:
            ingredient_id = get_or_create_lookup_id(
                supabase=supabase,
                table_name="ingredients",
                id_column="ingredient_id",
                name_column="ingredient_name",
                value=ingredient_name,
            )

            request_ingredient_row = {
                "request_id": request_id,
                "ingredient_id": ingredient_id,
            }
            (
                supabase.table("request_ingredient")
                .insert(request_ingredient_row)
                .execute()
            )

        # Do the same for equipment.
        for equipment_name in equipment_rows:
            equipment_id = get_or_create_lookup_id(
                supabase=supabase,
                table_name="equipment",
                id_column="equipment_id",
                name_column="equipment_name",
                value=equipment_name,
            )

            request_equipment_row = {
                "request_id": request_id,
                "equipment_id": equipment_id,
            }
            (
                supabase.table("request_equipment")
                .insert(request_equipment_row)
                .execute()
            )

    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error while preparing the request: {exc}",
        ) from exc

    return {
        "message": "Request received by backend.",
        "customer_id": assumed_customer_id,
        "request_id": request_id,
        "request_row": request_row,
        "ingredients_count": len(ingredient_rows),
        "equipment_count": len(equipment_rows),
    }


@app.patch("/requests/{request_id}/approve")
def approve_request(request_id: int):
    """Assign the demo chef to a request and mark it as accepted."""

    assumed_chef_id = os.getenv("ASSUMED_CHEF_ID", "chef_demo")

    try:
        supabase = get_supabase_client()

        updated_request = (
            supabase.table("request")
            .update(
                {
                    "chef_id": assumed_chef_id,
                    "accepted": True,
                }
            )
            .eq("request_id", request_id)
            .execute()
        )

        if not updated_request.data:
            raise HTTPException(status_code=404, detail="Request not found.")

    except HTTPException:
        raise
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error while approving the request: {exc}",
        ) from exc

    return {
        "message": "Request approved.",
        "request_id": request_id,
        "chef_id": assumed_chef_id,
        "accepted": True,
    }
