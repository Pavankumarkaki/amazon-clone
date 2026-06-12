import uuid
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import decode_token
from app.models.user import User
from app.repositories.user_repository import UserRepository

security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    db: Annotated[AsyncSession, Depends(get_db)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    refresh_token: Annotated[str | None, Cookie(alias="refresh_token")] = None,
) -> User | None:
    token = credentials.credentials if credentials else None
    if not token and refresh_token:
        payload = decode_token(refresh_token)
        if payload and payload.get("type") == "refresh":
            token = refresh_token

    if not token:
        return None

    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        return None

    user_id = uuid.UUID(payload["sub"])
    repo = UserRepository(db)
    return await repo.get_by_id(user_id)


async def get_current_user(
    user: Annotated[User | None, Depends(get_current_user_optional)],
) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user
