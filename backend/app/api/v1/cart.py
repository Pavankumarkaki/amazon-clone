import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartRead,
    CartValidateRequest,
    CartValidateResponse,
)
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartRead)
async def get_cart(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = CartService(db)
    return await service.get_cart(user)


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
async def add_cart_item(
    data: CartItemCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = CartService(db)
    return await service.add_item(user, data)


@router.patch("/items/{item_id}", response_model=CartRead)
async def update_cart_item(
    item_id: uuid.UUID,
    data: CartItemUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = CartService(db)
    return await service.update_item(user, item_id, data)


@router.delete("/items/{item_id}", response_model=CartRead)
async def remove_cart_item(
    item_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = CartService(db)
    return await service.remove_item(user, item_id)


@router.delete("", response_model=CartRead)
async def clear_cart(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = CartService(db)
    return await service.clear_cart(user)


@router.post("/validate", response_model=CartValidateResponse)
async def validate_cart(
    data: CartValidateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = CartService(db)
    return await service.validate(data.items)
