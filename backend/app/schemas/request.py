"""Schema for hire-a-chef form submissions."""

from datetime import date

from pydantic import BaseModel, Field


class HireChefRequest(BaseModel):
    """Shape of the request body sent by the React hire-a-chef form."""

    price: float
    date: date
    ingredients: list[str]
    equipment: list[str]
    summary: str = Field(min_length=1)
    chef_id: str | None = None
