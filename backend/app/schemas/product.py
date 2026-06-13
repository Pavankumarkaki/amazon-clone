import uuid
from typing import Any

from pydantic import Field

from app.schemas.common import ORMModel
from app.schemas.category import CategoryRead


class ProductImageRead(ORMModel):
    id: uuid.UUID
    url: str
    sort_order: int


class ProductCard(ORMModel):
    id: uuid.UUID
    title: str
    brand: str = ""
    price_cents: int
    mrp_cents: int | None = None
    discount_percentage: int = 0
    rating: float = 4.0
    reviews_count: int = 0
    currency: str
    stock: int
    category: CategoryRead
    images: list[ProductImageRead]


class ProductDetail(ProductCard):
    description: str
    specs: dict[str, Any]
    features: list[str] = Field(default_factory=list)
