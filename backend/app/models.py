import enum
from datetime import date, datetime
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Enum, ForeignKey, Text, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    viewer = "viewer"


class StatusKerja(str, enum.Enum):
    PNS = "PNS"
    Swasta = "Swasta"
    Wirausaha = "Wirausaha"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.viewer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    audit_logs = relationship("AuditLog", back_populates="user")


class AlumniBase(Base):
    __tablename__ = "alumni_base"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(255), nullable=False, index=True)
    nim = Column(String(50), unique=True, nullable=False, index=True)
    tahun_masuk = Column(Integer, nullable=True)
    tgl_lulus = Column(Date, nullable=True)
    fakultas = Column(String(150), nullable=True, index=True)
    prodi = Column(String(150), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    contact = relationship("AlumniContact", back_populates="alumni", uselist=False, cascade="all, delete-orphan")
    career = relationship("AlumniCareer", back_populates="alumni", uselist=False, cascade="all, delete-orphan")


class AlumniContact(Base):
    __tablename__ = "alumni_contact"

    id = Column(Integer, primary_key=True, index=True)
    nim = Column(String(50), ForeignKey("alumni_base.nim", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    linkedin = Column(String(500), nullable=True)
    instagram = Column(String(500), nullable=True)
    facebook = Column(String(500), nullable=True)
    tiktok = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    no_hp = Column(String(30), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    alumni = relationship("AlumniBase", back_populates="contact")


class AlumniCareer(Base):
    __tablename__ = "alumni_career"

    id = Column(Integer, primary_key=True, index=True)
    nim = Column(String(50), ForeignKey("alumni_base.nim", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    tempat_kerja = Column(String(255), nullable=True)
    alamat_kerja = Column(Text, nullable=True)
    posisi = Column(String(150), nullable=True)
    status_kerja = Column(Enum(StatusKerja), nullable=True)
    sosmed_instansi = Column(String(500), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    alumni = relationship("AlumniBase", back_populates="career")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(50), nullable=True)
    action = Column(String(50), nullable=False)      # e.g. LOGIN, VIEW, UPDATE_CONTACT
    resource = Column(String(100), nullable=True)     # e.g. /alumni/NIM
    detail = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")
