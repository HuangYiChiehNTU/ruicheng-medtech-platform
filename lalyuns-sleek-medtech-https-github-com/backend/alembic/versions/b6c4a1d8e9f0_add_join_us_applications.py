"""add join us applications

Revision ID: b6c4a1d8e9f0
Revises: a4f7c1e2d901
Create Date: 2026-05-27
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b6c4a1d8e9f0"
down_revision: Union[str, None] = "a4f7c1e2d901"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "join_us_applications",
        sa.Column("application_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=60), nullable=True),
        sa.Column("applicant_type", sa.String(length=80), nullable=True),
        sa.Column("interest", sa.String(length=180), nullable=False),
        sa.Column("portfolio_url", sa.Text(), nullable=True),
        sa.Column("intro", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("submitted", "reviewing", "contacted", "archived", name="joinusapplicationstatus"),
            nullable=False,
            server_default="submitted",
        ),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("application_id"),
    )


def downgrade() -> None:
    op.drop_table("join_us_applications")
    op.execute("DROP TYPE IF EXISTS joinusapplicationstatus")
