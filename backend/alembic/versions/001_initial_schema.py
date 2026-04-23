"""Initial schema: users, alumni_base, alumni_contact, alumni_career, audit_log

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enum types
    userrole = sa.Enum("admin", "viewer", name="userrole")
    statuskerja = sa.Enum("PNS", "Swasta", "Wirausaha", name="statuskerja")
    userrole.create(op.get_bind(), checkfirst=True)
    statuskerja.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.String(50), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("admin", "viewer", name="userrole"), nullable=False, server_default="viewer"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "alumni_base",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("nama", sa.String(255), nullable=False),
        sa.Column("nim", sa.String(50), unique=True, nullable=False),
        sa.Column("tahun_masuk", sa.Integer, nullable=True),
        sa.Column("tgl_lulus", sa.Date, nullable=True),
        sa.Column("fakultas", sa.String(150), nullable=True),
        sa.Column("prodi", sa.String(150), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_alumni_base_nim", "alumni_base", ["nim"])
    op.create_index("ix_alumni_base_nama", "alumni_base", ["nama"])
    op.create_index("ix_alumni_base_fakultas", "alumni_base", ["fakultas"])
    op.create_index("ix_alumni_base_prodi", "alumni_base", ["prodi"])

    op.create_table(
        "alumni_contact",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("nim", sa.String(50), sa.ForeignKey("alumni_base.nim", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("linkedin", sa.String(500), nullable=True),
        sa.Column("instagram", sa.String(500), nullable=True),
        sa.Column("facebook", sa.String(500), nullable=True),
        sa.Column("tiktok", sa.String(500), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("no_hp", sa.String(30), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "alumni_career",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("nim", sa.String(50), sa.ForeignKey("alumni_base.nim", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("tempat_kerja", sa.String(255), nullable=True),
        sa.Column("alamat_kerja", sa.Text, nullable=True),
        sa.Column("posisi", sa.String(150), nullable=True),
        sa.Column("status_kerja", sa.Enum("PNS", "Swasta", "Wirausaha", name="statuskerja"), nullable=True),
        sa.Column("sosmed_instansi", sa.String(500), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "audit_log",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("username", sa.String(50), nullable=True),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("resource", sa.String(100), nullable=True),
        sa.Column("detail", sa.Text, nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_audit_log_timestamp", "audit_log", ["timestamp"])


def downgrade() -> None:
    op.drop_table("audit_log")
    op.drop_table("alumni_career")
    op.drop_table("alumni_contact")
    op.drop_table("alumni_base")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS statuskerja")
    op.execute("DROP TYPE IF EXISTS userrole")
