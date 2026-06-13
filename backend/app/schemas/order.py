import uuid
import re
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.order import OrderStatus
from app.schemas.cart import CartItemInput
from app.schemas.common import ORMModel


class ShippingAddress(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr | None = None
    address_line1: str = Field(min_length=3, max_length=500)
    address_line2: str | None = None
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    postal_code: str = Field(min_length=6, max_length=6)
    country: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=10)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value)
        if not re.fullmatch(r"[6-9]\d{9}", digits):
            raise ValueError("Enter a valid 10-digit mobile number")
        return digits

    @field_validator("postal_code")
    @classmethod
    def validate_postal_code(cls, value: str) -> str:
        if not re.fullmatch(r"\d{6}", value):
            raise ValueError("PIN code must be 6 digits")
        return value


class OrderCreate(BaseModel):
    items: list[CartItemInput]
    shipping_address: ShippingAddress


class OrderItemRead(ORMModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price_cents: int
    title: str
    image_url: str | None = None


class OrderRead(ORMModel):
    id: uuid.UUID
    total_cents: int
    status: OrderStatus
    shipping_address: dict[str, Any]
    created_at: datetime
    items: list[OrderItemRead]


def order_to_read(order) -> OrderRead:
    items = []
    for item in order.items:
        product = item.product
        images = product.images if product else []
        items.append(
            OrderItemRead(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price_cents=item.unit_price_cents,
                title=product.title if product else "Product",
                image_url=images[0].url if images else None,
            )
        )
    return OrderRead(
        id=order.id,
        total_cents=order.total_cents,
        status=order.status,
        shipping_address=order.shipping_address,
        created_at=order.created_at,
        items=items,
    )
