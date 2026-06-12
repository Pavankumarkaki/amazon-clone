import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.db import get_db
from app.main import app
from app.models.category import Category
from app.models.product import Product, ProductImage

TEST_DATABASE_URL = "postgresql+asyncpg://amazon:amazon@localhost:5432/amazon_clone"


def _make_session_factory():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=pool.NullPool)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False), engine


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    session_factory, engine = _make_session_factory()
    async with session_factory() as session:
        yield session
        await session.rollback()
    await engine.dispose()


@pytest_asyncio.fixture
async def sample_product(db_session: AsyncSession) -> Product:
    suffix = uuid.uuid4().hex[:8]
    cat = Category(name=f"Test Cat {suffix}", slug=f"test-cat-{suffix}")
    db_session.add(cat)
    await db_session.flush()

    product = Product(
        title=f"Test Product {suffix}",
        description="A test product",
        price_cents=1000,
        stock=10,
        category_id=cat.id,
        specs={"Color": "Red"},
    )
    db_session.add(product)
    await db_session.flush()
    db_session.add(ProductImage(product_id=product.id, url="https://example.com/img.jpg", sort_order=0))
    await db_session.commit()
    await db_session.refresh(product)
    return product


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    session_factory, engine = _make_session_factory()

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
    await engine.dispose()
