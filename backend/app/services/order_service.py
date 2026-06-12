import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.user import User
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.cart import CartItemInput
from app.schemas.order import OrderCreate
from app.services.cart_service import CartService
from app.utils.email import send_order_confirmation


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.cart_service = CartService(db)

    async def create_order(
        self,
        data: OrderCreate,
        user: User | None = None,
    ) -> Order:
        validated = await self.cart_service.validate(data.items)

        product_ids = [item.product_id for item in data.items]
        products = await self.product_repo.get_by_ids(product_ids)
        product_map = {p.id: p for p in products}

        for item in data.items:
            product = product_map[item.product_id]
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for {product.title}",
                )
            product.stock -= item.quantity

        order_items = [
            {
                "product_id": line.product_id,
                "quantity": line.quantity,
                "unit_price_cents": line.unit_price_cents,
            }
            for line in validated.items
        ]

        order = await self.order_repo.create(
            user_id=user.id if user else None,
            total_cents=validated.total_cents,
            shipping_address=data.shipping_address.model_dump(),
            items=order_items,
        )

        await send_order_confirmation(
            to_email=user.email if user else "guest@example.com",
            order_id=str(order.id),
            total_cents=order.total_cents,
            recipient_name=data.shipping_address.full_name,
        )

        return order

    async def get_order(self, order_id: uuid.UUID, user: User | None = None) -> Order:
        order = await self.order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        if user and order.user_id and order.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return order

    async def list_orders(self, user: User) -> list[Order]:
        return await self.order_repo.list_by_user(user.id)
