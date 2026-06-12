import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.order import OrderStatus
from app.schemas.cart import CartItemInput
from app.schemas.common import ORMModel


class ShippingAddress(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    address_line1: str = Field(min_length=3, max_length=500)
    address_line2: str | None = None
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    postal_code: str = Field(min_length=3, max_length=20)
    country: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=20)


class OrderCreate(BaseModel):
    items: list[CartItemInput]
    shipping_address: ShippingAddress


class OrderItemRead(ORMModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price_cents: int


class OrderRead(ORMModel):
    id: uuid.UUID
    total_cents: int
    status: OrderStatus
    shipping_address: dict[str, Any]
    created_at: datetime
    items: list[OrderItemRead]
