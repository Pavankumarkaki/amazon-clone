import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.wishlist import WishlistAddRequest, WishlistItemRead
from app.services.wishlist_service import WishlistService

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistItemRead])
async def list_wishlist(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = WishlistService(db)
    items = await service.list_items(user)
    return [WishlistItemRead.model_validate(i) for i in items]


@router.post("", response_model=WishlistItemRead, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    data: WishlistAddRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = WishlistService(db)
    item = await service.add_item(user, data.product_id)
    return WishlistItemRead.model_validate(item)


@router.post("/{product_id}", response_model=WishlistItemRead, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist_by_path(
    product_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = WishlistService(db)
    item = await service.add_item(user, product_id)
    return WishlistItemRead.model_validate(item)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    service = WishlistService(db)
    await service.remove_item(user, product_id)
