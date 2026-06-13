import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.cart import (
    CartItemCreate,
    CartItemInput,
    CartItemRead,
    CartItemUpdate,
    CartLineItem,
    CartRead,
    CartValidateResponse,
)


class CartService:
    TAX_RATE = 0.18

    def __init__(self, db: AsyncSession):
        self.db = db
        self.cart_repo = CartRepository(db)
        self.product_repo = ProductRepository(db)

    def _build_cart_read(self, cart) -> CartRead:
        items: list[CartItemRead] = []
        subtotal = 0

        for item in cart.items:
            product = item.product
            line_total = product.price_cents * item.quantity
            subtotal += line_total
            image_url = product.images[0].url if product.images else None

            items.append(
                CartItemRead(
                    id=item.id,
                    product_id=product.id,
                    title=product.title,
                    quantity=item.quantity,
                    unit_price_cents=product.price_cents,
                    line_total_cents=line_total,
                    image_url=image_url,
                    stock=product.stock,
                    currency=product.currency,
                )
            )

        tax_cents = round(subtotal * self.TAX_RATE)
        return CartRead(
            id=cart.id,
            items=items,
            subtotal_cents=subtotal,
            tax_cents=tax_cents,
            total_cents=subtotal + tax_cents,
        )

    async def get_cart(self, user: User) -> CartRead:
        cart = await self.cart_repo.get_or_create(user.id)
        cart = await self.cart_repo.reload_cart(cart.id)
        return self._build_cart_read(cart)

    async def add_item(self, user: User, data: CartItemCreate) -> CartRead:
        product = await self.product_repo.get_by_id(data.product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        existing = await self.cart_repo.get_by_user_id(user.id)
        if existing:
            existing_item = await self.cart_repo.get_item_by_product(existing.id, data.product_id)
            if existing_item and existing_item.quantity + data.quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product.title}",
                )
        elif data.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.title}",
            )

        cart = await self.cart_repo.get_or_create(user.id)
        await self.cart_repo.add_item(cart, data.product_id, data.quantity)
        cart = await self.cart_repo.reload_cart(cart.id)
        return self._build_cart_read(cart)

    async def update_item(self, user: User, item_id: uuid.UUID, data: CartItemUpdate) -> CartRead:
        item = await self.cart_repo.get_item_by_id(item_id, user.id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

        if data.quantity > item.product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {item.product.title}",
            )

        await self.cart_repo.update_quantity(item, data.quantity)
        cart = await self.cart_repo.reload_cart(item.cart_id)
        return self._build_cart_read(cart)

    async def remove_item(self, user: User, item_id: uuid.UUID) -> CartRead:
        item = await self.cart_repo.get_item_by_id(item_id, user.id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

        cart_id = item.cart_id
        await self.cart_repo.remove_item(item)
        cart = await self.cart_repo.reload_cart(cart_id)
        return self._build_cart_read(cart)

    async def clear_cart(self, user: User) -> CartRead:
        cart = await self.cart_repo.get_or_create(user.id)
        for item in list(cart.items):
            await self.cart_repo.remove_item(item)
        cart = await self.cart_repo.reload_cart(cart.id)
        return self._build_cart_read(cart)

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

        tax_cents = round(subtotal * self.TAX_RATE)
        return CartValidateResponse(
            items=lines,
            subtotal_cents=subtotal,
            tax_cents=tax_cents,
            total_cents=subtotal + tax_cents,
        )
