import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product
from app.models.wishlist import Wishlist, WishlistItem


class WishlistRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_wishlist(self, user_id: uuid.UUID) -> Wishlist:
        result = await self.db.execute(select(Wishlist).where(Wishlist.user_id == user_id))
        wishlist = result.scalar_one_or_none()
        if wishlist:
            return wishlist
        wishlist = Wishlist(user_id=user_id)
        self.db.add(wishlist)
        await self.db.flush()
        return wishlist

    async def list_by_user(self, user_id: uuid.UUID) -> list[WishlistItem]:
        result = await self.db.execute(
            select(WishlistItem)
            .join(Wishlist)
            .options(
                selectinload(WishlistItem.product).selectinload(Product.images),
                selectinload(WishlistItem.product).selectinload(Product.category),
            )
            .where(Wishlist.user_id == user_id)
            .order_by(WishlistItem.created_at.desc())
        )
        return list(result.scalars().unique().all())

    async def get_item(self, user_id: uuid.UUID, product_id: uuid.UUID) -> WishlistItem | None:
        result = await self.db.execute(
            select(WishlistItem)
            .join(Wishlist)
            .options(
                selectinload(WishlistItem.product).selectinload(Product.images),
                selectinload(WishlistItem.product).selectinload(Product.category),
            )
            .where(Wishlist.user_id == user_id, WishlistItem.product_id == product_id)
        )
        return result.scalar_one_or_none()

    async def add(self, user_id: uuid.UUID, product_id: uuid.UUID) -> WishlistItem:
        wishlist = await self.get_or_create_wishlist(user_id)
        item = WishlistItem(wishlist_id=wishlist.id, product_id=product_id)
        self.db.add(item)
        await self.db.flush()
        return item

    async def remove(self, item: WishlistItem) -> None:
        await self.db.delete(item)
