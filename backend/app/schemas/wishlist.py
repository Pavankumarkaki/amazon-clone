import uuid
from datetime import datetime

from app.schemas.common import ORMModel
from app.schemas.product import ProductCard


class WishlistItemRead(ORMModel):
    id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime
    product: ProductCard
