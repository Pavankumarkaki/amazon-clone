import uuid

import pytest
from fastapi import HTTPException

from app.schemas.cart import CartItemInput
from app.services.cart_service import CartService


@pytest.mark.asyncio
async def test_validate_empty_cart(db_session):
    service = CartService(db_session)
    with pytest.raises(HTTPException) as exc:
        await service.validate([])
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_validate_product_not_found(db_session):
    service = CartService(db_session)
    with pytest.raises(HTTPException) as exc:
        await service.validate([CartItemInput(product_id=uuid.uuid4(), quantity=1)])
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_validate_success(sample_product, db_session):
    service = CartService(db_session)
    result = await service.validate([CartItemInput(product_id=sample_product.id, quantity=2)])
    assert result.subtotal_cents == 2000
    assert result.total_cents == 2000
    assert len(result.items) == 1
    assert result.items[0].quantity == 2


@pytest.mark.asyncio
async def test_validate_insufficient_stock(sample_product, db_session):
    service = CartService(db_session)
    with pytest.raises(HTTPException) as exc:
        await service.validate([CartItemInput(product_id=sample_product.id, quantity=100)])
    assert exc.value.status_code == 400
