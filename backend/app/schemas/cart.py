import uuid

from pydantic import BaseModel, Field


class CartItemInput(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1, le=999)


class CartItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(default=1, ge=1, le=999)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=999)


class CartValidateRequest(BaseModel):
    items: list[CartItemInput] = Field(min_length=1)


class CartLineItem(BaseModel):
    product_id: uuid.UUID
    title: str
    quantity: int
    unit_price_cents: int
    line_total_cents: int
    image_url: str | None = None
    stock: int


class CartItemRead(CartLineItem):
    id: uuid.UUID
    currency: str = "INR"


class CartRead(BaseModel):
    id: uuid.UUID
    items: list[CartItemRead]
    subtotal_cents: int
    tax_cents: int
    total_cents: int


class CartValidateResponse(BaseModel):
    items: list[CartLineItem]
    subtotal_cents: int
    tax_cents: int = 0
    total_cents: int
