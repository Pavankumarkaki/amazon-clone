from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryRead

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
async def list_categories(db: Annotated[AsyncSession, Depends(get_db)]):
    repo = CategoryRepository(db)
    categories = await repo.list_all()
    return [CategoryRead.model_validate(c) for c in categories]
