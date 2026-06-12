import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem, OrderStatus


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        *,
        user_id: uuid.UUID | None,
        total_cents: int,
        shipping_address: dict,
        items: list[dict],
    ) -> Order:
        order = Order(
            user_id=user_id,
            total_cents=total_cents,
            status=OrderStatus.PENDING,
            shipping_address=shipping_address,
        )
        self.db.add(order)
        await self.db.flush()

        for item in items:
            self.db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=item["product_id"],
                    quantity=item["quantity"],
                    unit_price_cents=item["unit_price_cents"],
                )
            )

        await self.db.flush()
        await self.db.refresh(order)
        return await self.get_by_id(order.id)

    async def get_by_id(self, order_id: uuid.UUID) -> Order | None:
        result = await self.db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: uuid.UUID) -> list[Order]:
        result = await self.db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
        )
        return list(result.scalars().unique().all())
