import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.wishlist import WishlistItem
from app.repositories.product_repository import ProductRepository
from app.repositories.wishlist_repository import WishlistRepository


class WishlistService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.wishlist_repo = WishlistRepository(db)
        self.product_repo = ProductRepository(db)

    async def list_items(self, user: User) -> list[WishlistItem]:
        return await self.wishlist_repo.list_by_user(user.id)

    async def add_item(self, user: User, product_id: uuid.UUID) -> WishlistItem:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        existing = await self.wishlist_repo.get_item(user.id, product_id)
        if existing:
            return existing

        await self.wishlist_repo.add(user.id, product_id)
        item = await self.wishlist_repo.get_item(user.id, product_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add item")
        return item

    async def remove_item(self, user: User, product_id: uuid.UUID) -> None:
        item = await self.wishlist_repo.get_item(user.id, product_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found")
        await self.wishlist_repo.remove(item)
