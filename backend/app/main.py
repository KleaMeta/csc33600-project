"""Backend app setup."""

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth_router, requests_router, system_router
from app.api.routes.reviews import router as reviews_router
from app.db.session import database
from app.api.routes import chat, revenue
from app.api.routes import banking, payment_info, billing
from app.api.routes import admin

load_dotenv()

app = FastAPI(title="Cheffy Backend")

REPO_ROOT = Path(__file__).resolve().parents[2]
IMAGES_DIR = REPO_ROOT / "database" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Open DB connection pool when app starts."""

    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    """Close DB connection pool when app stops."""

    await database.disconnect()


app.include_router(system_router)
app.include_router(auth_router)
app.include_router(requests_router)
app.include_router(reviews_router)
app.include_router(chat.router)
app.include_router(banking.router)
app.include_router(payment_info.router)
app.include_router(billing.router)
app.include_router(revenue.router)
app.include_router(admin.router)