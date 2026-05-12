from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.api.routes.ai_rag import get_chef_recommendations

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(req: ChatRequest):
    result = await get_chef_recommendations(req.message)

    return {
        "reply": result["recommendation"],
        "chefs": result["chefs"]
    }