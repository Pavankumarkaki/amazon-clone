import uuid
from typing import Any

from app.schemas.common import ORMModel
from app.schemas.category import CategoryRead


class ProductImageRead(ORMModel):
    id: uuid.UUID
    url: str
    sort_order: int


class ProductCard(ORMModel):
    id: uuid.UUID
    title: str
    price_cents: int
    currency: str
    stock: int
    category: CategoryRead
    images: list[ProductImageRead]


class ProductDetail(ProductCard):
    description: str
    specs: dict[str, Any]
