import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.product_repository import ProductRepository
from app.schemas.cart import CartItemInput, CartLineItem, CartValidateResponse


class CartService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.product_repo = ProductRepository(db)

    async def validate(self, items: list[CartItemInput]) -> CartValidateResponse:
        if not items:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

        product_ids = [item.product_id for item in items]
        products = await self.product_repo.get_by_ids(product_ids)
        product_map = {p.id: p for p in products}

        lines: list[CartLineItem] = []
        subtotal = 0

        for item in items:
            product = product_map.get(item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_id} not found",
                )
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product.title}",
                )

            line_total = product.price_cents * item.quantity
            subtotal += line_total
            image_url = product.images[0].url if product.images else None

            lines.append(
                CartLineItem(
                    product_id=product.id,
                    title=product.title,
                    quantity=item.quantity,
                    unit_price_cents=product.price_cents,
                    line_total_cents=line_total,
                    image_url=image_url,
                    stock=product.stock,
                )
            )

        return CartValidateResponse(items=lines, subtotal_cents=subtotal, total_cents=subtotal)
