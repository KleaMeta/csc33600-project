"""Simple request-header based role checks for this project."""

from fastapi import HTTPException, Request


def get_role_and_user_id(request: Request) -> tuple[str | None, str | None]:
    """Read role and user id from request headers."""

    role = request.headers.get("X-User-Role")
    user_id = request.headers.get("X-User-Id")
    return role, user_id


def require_role(request: Request, allowed_roles: set[str]) -> tuple[str, str]:
    """Ensure request is authenticated and role is allowed."""

    role, user_id = get_role_and_user_id(request)

    if not role or not user_id:
        raise HTTPException(status_code=401, detail="You must be logged in.")

    if role not in allowed_roles:
        raise HTTPException(status_code=403, detail="You are not allowed to do this.")

    return role, user_id
