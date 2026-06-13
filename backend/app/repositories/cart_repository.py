import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cart import Cart, CartItem
from app.models.product import Product


class CartRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _cart_query(self):
        return (
            select(Cart)
            .options(
                selectinload(Cart.items)
                .selectinload(CartItem.product)
                .selectinload(Product.images),
                selectinload(Cart.items)
                .selectinload(CartItem.product)
                .selectinload(Product.category),
            )
        )

    async def get_by_user_id(self, user_id: uuid.UUID) -> Cart | None:
        result = await self.db.execute(self._cart_query().where(Cart.user_id == user_id))
        return result.scalar_one_or_none()

    async def get_or_create(self, user_id: uuid.UUID) -> Cart:
        cart = await self.get_by_user_id(user_id)
        if cart:
            return cart
        cart = Cart(user_id=user_id)
        self.db.add(cart)
        await self.db.flush()
        await self.db.refresh(cart)
        return cart

    async def get_item_by_id(self, item_id: uuid.UUID, user_id: uuid.UUID) -> CartItem | None:
        result = await self.db.execute(
            select(CartItem)
            .join(Cart)
            .options(
                selectinload(CartItem.product).selectinload(Product.images),
                selectinload(CartItem.product).selectinload(Product.category),
            )
            .where(CartItem.id == item_id, Cart.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_item_by_product(self, cart_id: uuid.UUID, product_id: uuid.UUID) -> CartItem | None:
        result = await self.db.execute(
            select(CartItem).where(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
        )
        return result.scalar_one_or_none()

    async def add_item(self, cart: Cart, product_id: uuid.UUID, quantity: int) -> CartItem:
        existing = await self.get_item_by_product(cart.id, product_id)
        if existing:
            existing.quantity += quantity
            await self.db.flush()
            return existing

        item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        self.db.add(item)
        await self.db.flush()
        return item

    async def update_quantity(self, item: CartItem, quantity: int) -> CartItem:
        item.quantity = quantity
        await self.db.flush()
        return item

    async def remove_item(self, item: CartItem) -> None:
        await self.db.delete(item)

    async def reload_cart(self, cart_id: uuid.UUID) -> Cart:
        result = await self.db.execute(self._cart_query().where(Cart.id == cart_id))
        return result.scalar_one()
