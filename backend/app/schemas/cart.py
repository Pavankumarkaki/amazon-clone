import uuid

from pydantic import BaseModel, Field


class CartItemInput(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1)


class CartValidateRequest(BaseModel):
    items: list[CartItemInput]


class CartLineItem(BaseModel):
    product_id: uuid.UUID
    title: str
    quantity: int
    unit_price_cents: int
    line_total_cents: int
    image_url: str | None = None
    stock: int


class CartValidateResponse(BaseModel):
    items: list[CartLineItem]
    subtotal_cents: int
    total_cents: int
