from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from app.models import UserRole, StatusKerja


# ─── Auth ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


# ─── Alumni Contact ──────────────────────────────────────────────────────────

class AlumniContactUpdate(BaseModel):
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    tiktok: Optional[str] = None
    email: Optional[str] = None
    no_hp: Optional[str] = None


class AlumniContactOut(AlumniContactUpdate):
    nim: str
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Alumni Career ───────────────────────────────────────────────────────────

class AlumniCareerUpdate(BaseModel):
    tempat_kerja: Optional[str] = None
    alamat_kerja: Optional[str] = None
    posisi: Optional[str] = None
    status_kerja: Optional[StatusKerja] = None
    sosmed_instansi: Optional[str] = None


class AlumniCareerOut(AlumniCareerUpdate):
    nim: str
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Alumni ──────────────────────────────────────────────────────────────────

class AlumniBaseOut(BaseModel):
    id: int
    nama: str
    nim: str
    tahun_masuk: Optional[int] = None
    tgl_lulus: Optional[date] = None
    fakultas: Optional[str] = None
    prodi: Optional[str] = None
    contact: Optional[AlumniContactOut] = None
    career: Optional[AlumniCareerOut] = None

    class Config:
        from_attributes = True


class AlumniListItem(BaseModel):
    id: int
    nama: str
    nim: str
    tahun_masuk: Optional[int] = None
    prodi: Optional[str] = None
    fakultas: Optional[str] = None
    tgl_lulus: Optional[date] = None
    has_contact: bool = False
    has_career: bool = False
    # Additional fields for the table in Image 2
    tempat_kerja: Optional[str] = None
    posisi: Optional[str] = None
    alamat_kerja: Optional[str] = None
    status_kerja: Optional[StatusKerja] = None

    class Config:
        from_attributes = True


class PaginatedAlumni(BaseModel):
    data: list[AlumniListItem]
    total: int
    page: int
    total_pages: int
    limit: int


# ─── Audit Log ───────────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: int
    username: Optional[str] = None
    action: str
    resource: Optional[str] = None
    detail: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class PaginatedAuditLog(BaseModel):
    data: list[AuditLogOut]
    total: int
    page: int
    total_pages: int
    limit: int


# ─── Stats ───────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_alumni: int
    with_contact: int
    with_career: int
    pct_contact: float
    pct_career: float
    per_tahun: dict
    per_fakultas: dict
