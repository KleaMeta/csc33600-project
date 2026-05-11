"""Schema for banking form submissions."""

from pydantic import BaseModel, Field, field_validator


class PaymentInfoCreate(BaseModel):
    name_on_card: str = Field(..., min_length=1, max_length=255)
    cc_number: str = Field(..., min_length=12, max_length=20)
    exp_month: str = Field(..., min_length=1, max_length=2)
    exp_year: str = Field(..., min_length=4, max_length=4)
    cvc: str = Field(..., min_length=3, max_length=4)

    @field_validator("cc_number")
    def validate_cc_number(cls, v):
        if not v.isdigit():
            raise ValueError("Card number must contain only digits")
        return v

    @field_validator("exp_month")
    def validate_exp_month(cls, v):
        if not v.isdigit():
            raise ValueError("Month must be numeric")
        month = int(v)
        if month < 1 or month > 12:
            raise ValueError("Month must be between 01-12")
        return v

    @field_validator("exp_year")
    def validate_exp_year(cls, v):
        if not v.isdigit():
            raise ValueError("Year must be numeric")
        return v

    @field_validator("cvc")
    def validate_cvc(cls, v):
        if not v.isdigit():
            raise ValueError("CVC must contain only digits")
        return v


class ChefBankInfoCreate(BaseModel):
    account_number: str = Field(..., min_length=4, max_length=255)
    routing_number: str = Field(..., min_length=9, max_length=10)