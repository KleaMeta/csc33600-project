"""Schema for banking form submissions."""

from pydantic import BaseModel, Field


class PaymentInfoCreate(BaseModel):
    name_on_card: str = Field(..., min_length=1, max_length=255)
    cc_number: int
    exp_month: int
    exp_year: int
    cvc: int


class ChefBankInfoCreate(BaseModel):
    account_number: str = Field(..., min_length=4, max_length=255)
    routing_number: str = Field(..., min_length=9, max_length=10)