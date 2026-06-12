import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _base_query(self):
        return select(Product).options(
            selectinload(Product.images),
            selectinload(Product.category),
        )

    async def list_products(
        self,
        *,
        search: str | None = None,
        category_slug: str | None = None,
        page: int = 1,
        page_size: int = 12,
        sort: str = "newest",
    ) -> tuple[list[Product], int]:
        query = self._base_query()
        count_query = select(func.count()).select_from(Product)

        if search:
            pattern = f"%{search}%"
            query = query.where(Product.title.ilike(pattern))
            count_query = count_query.where(Product.title.ilike(pattern))

        if category_slug:
            from app.models.category import Category

            query = query.join(Category).where(Category.slug == category_slug)
            count_query = count_query.join(Category).where(Category.slug == category_slug)

        if sort == "price_asc":
            query = query.order_by(Product.price_cents.asc())
        elif sort == "price_desc":
            query = query.order_by(Product.price_cents.desc())
        else:
            query = query.order_by(Product.created_at.desc())

        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        count_result = await self.db.execute(count_query)
        return list(result.scalars().unique().all()), count_result.scalar_one()

    async def get_by_id(self, product_id: uuid.UUID) -> Product | None:
        result = await self.db.execute(self._base_query().where(Product.id == product_id))
        return result.scalar_one_or_none()

    async def get_by_ids(self, product_ids: list[uuid.UUID]) -> list[Product]:
        if not product_ids:
            return []
        result = await self.db.execute(self._base_query().where(Product.id.in_(product_ids)))
        return list(result.scalars().unique().all())
