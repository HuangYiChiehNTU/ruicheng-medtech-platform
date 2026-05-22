"""add product order fields

Revision ID: a4f7c1e2d901
Revises: 7d81f0c9b2aa
Create Date: 2026-05-22 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "a4f7c1e2d901"
down_revision = "7d81f0c9b2aa"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("product_type", sa.String(length=40), nullable=False, server_default="3d_product"))
    op.add_column("products", sa.Column("image_url", sa.Text(), nullable=True))
    op.add_column("products", sa.Column("senior_note", sa.Text(), nullable=True))
    op.add_column("products", sa.Column("order_enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("product_requests", sa.Column("request_source", sa.String(length=40), nullable=False, server_default="web"))
    op.add_column("product_requests", sa.Column("request_type", sa.String(length=40), nullable=False, server_default="order"))
    op.add_column("product_requests", sa.Column("preferred_contact", sa.String(length=80), nullable=True))
    op.add_column("product_requests", sa.Column("delivery_note", sa.Text(), nullable=True))
    op.add_column("product_requests", sa.Column("line_user_id", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("product_requests", "line_user_id")
    op.drop_column("product_requests", "delivery_note")
    op.drop_column("product_requests", "preferred_contact")
    op.drop_column("product_requests", "request_type")
    op.drop_column("product_requests", "request_source")
    op.drop_column("products", "order_enabled")
    op.drop_column("products", "senior_note")
    op.drop_column("products", "image_url")
    op.drop_column("products", "product_type")
