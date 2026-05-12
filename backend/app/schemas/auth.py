"""Schemas for simple role-based login."""

from pydantic import BaseModel


class LoginRequest(BaseModel):
    """Login payload for chef/customer endpoints."""

    email: str
    password: str
