import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.repositories.product_repository import ProductRepository
from app.schemas.common import PaginatedResponse
from app.schemas.product import ProductCard, ProductDetail

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=PaginatedResponse[ProductCard])
async def list_products(
    db: Annotated[AsyncSession, Depends(get_db)],
    search: str | None = None,
    category: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    sort: str = Query("newest", pattern="^(newest|price_asc|price_desc)$"),
):
    repo = ProductRepository(db)
    products, total = await repo.list_products(
        search=search,
        category_slug=category,
        page=page,
        page_size=page_size,
        sort=sort,
    )
    return PaginatedResponse(
        items=[ProductCard.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{product_id}", response_model=ProductDetail)
async def get_product(
    product_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = ProductRepository(db)
    product = await repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductDetail.model_validate(product)
