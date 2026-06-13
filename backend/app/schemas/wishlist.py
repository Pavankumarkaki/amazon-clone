import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel
from app.schemas.product import ProductCard


class WishlistAddRequest(BaseModel):
    product_id: uuid.UUID


class WishlistItemRead(ORMModel):
    id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime
    product: ProductCard
