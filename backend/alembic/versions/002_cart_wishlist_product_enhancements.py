"""cart, wishlists, product enhancements

Revision ID: 002
Revises: 001
Create Date: 2026-06-13

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("brand", sa.String(length=200), server_default="", nullable=False))
    op.add_column("products", sa.Column("mrp_cents", sa.Integer(), nullable=True))
    op.add_column(
        "products",
        sa.Column("discount_percentage", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "products",
        sa.Column("rating", sa.Numeric(precision=2, scale=1), server_default="4.0", nullable=False),
    )
    op.add_column(
        "products",
        sa.Column("reviews_count", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "products",
        sa.Column(
            "features",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_products_created_at"), "products", ["created_at"], unique=False)
    op.create_index(op.f("ix_products_price_cents"), "products", ["price_cents"], unique=False)

    op.execute(
        """
        UPDATE products
        SET mrp_cents = ROUND(price_cents / 0.85),
            discount_percentage = 15,
            reviews_count = 500 + (abs(hashtext(id::text)) % 9500),
            rating = 3.5 + (abs(hashtext(id::text)) % 15)::numeric / 10,
            brand = COALESCE(specs->>'Brand', specs->>'brand', 'Generic')
        WHERE mrp_cents IS NULL
        """
    )

    op.create_table(
        "carts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_carts_user_id"), "carts", ["user_id"], unique=True)

    op.create_table(
        "cart_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cart_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["cart_id"], ["carts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("cart_id", "product_id", name="uq_cart_product"),
    )
    op.create_index(op.f("ix_cart_items_cart_id"), "cart_items", ["cart_id"], unique=False)
    op.create_index(op.f("ix_cart_items_product_id"), "cart_items", ["product_id"], unique=False)

    op.create_table(
        "wishlists",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_wishlists_user_id"), "wishlists", ["user_id"], unique=True)

    op.execute(
        """
        INSERT INTO wishlists (id, user_id, created_at)
        SELECT gen_random_uuid(), user_id, MIN(created_at)
        FROM wishlist_items
        GROUP BY user_id
        """
    )

    op.add_column("wishlist_items", sa.Column("wishlist_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.execute(
        """
        UPDATE wishlist_items wi
        SET wishlist_id = w.id
        FROM wishlists w
        WHERE wi.user_id = w.user_id
        """
    )
    op.alter_column("wishlist_items", "wishlist_id", nullable=False)

    op.drop_constraint("uq_wishlist_user_product", "wishlist_items", type_="unique")
    op.drop_index(op.f("ix_wishlist_items_user_id"), table_name="wishlist_items")
    op.drop_constraint("wishlist_items_user_id_fkey", "wishlist_items", type_="foreignkey")
    op.drop_column("wishlist_items", "user_id")

    op.create_foreign_key(
        "wishlist_items_wishlist_id_fkey",
        "wishlist_items",
        "wishlists",
        ["wishlist_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(op.f("ix_wishlist_items_wishlist_id"), "wishlist_items", ["wishlist_id"], unique=False)
    op.create_unique_constraint("uq_wishlist_product", "wishlist_items", ["wishlist_id", "product_id"])


def downgrade() -> None:
    op.add_column("wishlist_items", sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.execute(
        """
        UPDATE wishlist_items wi
        SET user_id = w.user_id
        FROM wishlists w
        WHERE wi.wishlist_id = w.id
        """
    )
    op.alter_column("wishlist_items", "user_id", nullable=False)

    op.drop_constraint("uq_wishlist_product", "wishlist_items", type_="unique")
    op.drop_constraint("wishlist_items_wishlist_id_fkey", "wishlist_items", type_="foreignkey")
    op.drop_index(op.f("ix_wishlist_items_wishlist_id"), table_name="wishlist_items")
    op.drop_column("wishlist_items", "wishlist_id")

    op.create_foreign_key(
        "wishlist_items_user_id_fkey",
        "wishlist_items",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(op.f("ix_wishlist_items_user_id"), "wishlist_items", ["user_id"], unique=False)
    op.create_unique_constraint("uq_wishlist_user_product", "wishlist_items", ["user_id", "product_id"])

    op.drop_table("wishlists")
    op.drop_table("cart_items")
    op.drop_table("carts")

    op.drop_index(op.f("ix_products_price_cents"), table_name="products")
    op.drop_index(op.f("ix_products_created_at"), table_name="products")
    op.drop_column("products", "features")
    op.drop_column("products", "reviews_count")
    op.drop_column("products", "rating")
    op.drop_column("products", "discount_percentage")
    op.drop_column("products", "mrp_cents")
    op.drop_column("products", "brand")
