from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.schemas.cart import CartValidateRequest, CartValidateResponse
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/validate", response_model=CartValidateResponse)
async def validate_cart(
    data: CartValidateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = CartService(db)
    return await service.validate(data.items)
