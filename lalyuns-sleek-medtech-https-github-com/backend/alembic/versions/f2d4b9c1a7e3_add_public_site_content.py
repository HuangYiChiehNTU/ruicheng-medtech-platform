"""add public site content

Revision ID: f2d4b9c1a7e3
Revises: c8e2f184a7d5
Create Date: 2026-05-18
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f2d4b9c1a7e3"
down_revision: Union[str, None] = "c8e2f184a7d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "public_site_contents",
        sa.Column("content_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("content_id"),
        sa.UniqueConstraint("slug"),
    )


def downgrade() -> None:
    op.drop_table("public_site_contents")
