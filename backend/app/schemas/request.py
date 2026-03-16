"""Schema for hire-a-chef form submissions."""

from pydantic import BaseModel, Field


class HireChefRequest(BaseModel):
    """Shape of the request body sent by the React hire-a-chef form."""

    price: float
    date: str
    ingredients: list[str]
    equipment: list[str]
    summary: str = Field(min_length=1)
