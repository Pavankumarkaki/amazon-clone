import uuid

from app.schemas.common import ORMModel


class CategoryRead(ORMModel):
    id: uuid.UUID
    name: str
    slug: str
