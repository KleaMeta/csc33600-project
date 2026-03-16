"""Supabase client setup for the backend."""

import os

from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()


def get_supabase_client() -> Client:
    """Create a Supabase client from values stored in backend/.env."""

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_KEY must be set in backend/.env."
        )

    return create_client(supabase_url, supabase_key)
