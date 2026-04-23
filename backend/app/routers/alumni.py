import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import AlumniBase, AlumniContact, AlumniCareer, User
from app.schemas import (
    AlumniBaseOut,
    AlumniListItem,
    AlumniContactUpdate,
    AlumniCareerUpdate,
    PaginatedAlumni,
    DashboardStats,
)
from app.security import get_current_user, get_current_user_optional, log_action

router = APIRouter(prefix="/alumni", tags=["Alumni"])


# ─── GET /alumni ──────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedAlumni)
def list_alumni(
    request: Request,
    search: Optional[str] = Query(None, description="Search keyword"),
    category: Optional[str] = Query(None, description="nama, nim, prodi, fakultas"),
    fakultas: Optional[str] = Query(None),
    prodi: Optional[str] = Query(None),
    tahun: Optional[int] = Query(None, description="Tahun lulus (extract dari tgl_lulus)"),
    has_contact: Optional[bool] = Query(None),
    has_career: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(AlumniBase).options(
        joinedload(AlumniBase.contact),
        joinedload(AlumniBase.career),
    )

    if search:
        if category == "nama":
            query = query.filter(AlumniBase.nama.ilike(f"%{search}%"))
        elif category == "nim":
            query = query.filter(AlumniBase.nim.ilike(f"%{search}%"))
        elif category == "prodi":
            query = query.filter(AlumniBase.prodi.ilike(f"%{search}%"))
        elif category == "fakultas":
            query = query.filter(AlumniBase.fakultas.ilike(f"%{search}%"))
        else:
            # Default: Nama or NIM
            query = query.filter(
                or_(
                    AlumniBase.nama.ilike(f"%{search}%"),
                    AlumniBase.nim.ilike(f"%{search}%"),
                )
            )

    if fakultas:
        query = query.filter(AlumniBase.fakultas.ilike(f"%{fakultas}%"))
    if prodi:
        query = query.filter(AlumniBase.prodi.ilike(f"%{prodi}%"))
    if tahun:
        query = query.filter(func.extract("year", AlumniBase.tgl_lulus) == tahun)
    
    if has_contact is True:
        query = query.join(AlumniContact, AlumniBase.nim == AlumniContact.nim)
    elif has_contact is False:
        query = query.outerjoin(AlumniContact, AlumniBase.nim == AlumniContact.nim).filter(
            AlumniContact.nim == None
        )
    
    if has_career is True:
        query = query.join(AlumniCareer, AlumniBase.nim == AlumniCareer.nim)
    elif has_career is False:
        query = query.outerjoin(AlumniCareer, AlumniBase.nim == AlumniCareer.nim).filter(
            AlumniCareer.nim == None
        )

    total = query.count()
    total_pages = max(1, math.ceil(total / limit))
    page = min(page, total_pages)
    records = query.offset((page - 1) * limit).limit(limit).all()

    data = []
    for r in records:
        data.append(
            AlumniListItem(
                id=r.id,
                nama=r.nama,
                nim=r.nim,
                tahun_masuk=r.tahun_masuk,
                prodi=r.prodi,
                fakultas=r.fakultas,
                tgl_lulus=r.tgl_lulus,
                has_contact=r.contact is not None,
                has_career=r.career is not None,
                tempat_kerja=r.career.tempat_kerja if r.career else None,
                posisi=r.career.posisi if r.career else None,
                alamat_kerja=r.career.alamat_kerja if r.career else None,
                status_kerja=r.career.status_kerja if r.career else None,
            )
        )

    log_action(
        db, current_user, "VIEW_LIST", "/alumni",
        detail=f"search={search} category={category} fakultas={fakultas} prodi={prodi} page={page}",
        ip_address=request.client.host if request.client else None,
    )

    return PaginatedAlumni(data=data, total=total, page=page, total_pages=total_pages, limit=limit)


# ─── GET /alumni/{nim} ────────────────────────────────────────────────────────

@router.get("/{nim}", response_model=AlumniBaseOut)
def get_alumni(
    nim: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alumni = (
        db.query(AlumniBase)
        .options(joinedload(AlumniBase.contact), joinedload(AlumniBase.career))
        .filter(AlumniBase.nim == nim)
        .first()
    )
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni tidak ditemukan.")

    log_action(
        db, current_user, "VIEW_DETAIL", f"/alumni/{nim}",
        ip_address=request.client.host if request.client else None,
    )
    return alumni


# ─── PUT /alumni/{nim}/contact ────────────────────────────────────────────────

@router.put("/{nim}/contact")
def update_contact(
    nim: str,
    payload: AlumniContactUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "viewer":
        raise HTTPException(status_code=403, detail="Viewer tidak dapat mengubah data.")

    alumni = db.query(AlumniBase).filter(AlumniBase.nim == nim).first()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni tidak ditemukan.")

    contact = db.query(AlumniContact).filter(AlumniContact.nim == nim).first()
    if not contact:
        contact = AlumniContact(nim=nim)
        db.add(contact)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)

    log_action(
        db, current_user, "UPDATE_CONTACT", f"/alumni/{nim}/contact",
        detail=str(payload.model_dump(exclude_unset=True)),
        ip_address=request.client.host if request.client else None,
    )
    return {"message": "Data kontak berhasil diperbarui.", "nim": nim}


# ─── PUT /alumni/{nim}/career ─────────────────────────────────────────────────

@router.put("/{nim}/career")
def update_career(
    nim: str,
    payload: AlumniCareerUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "viewer":
        raise HTTPException(status_code=403, detail="Viewer tidak dapat mengubah data.")

    alumni = db.query(AlumniBase).filter(AlumniBase.nim == nim).first()
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni tidak ditemukan.")

    career = db.query(AlumniCareer).filter(AlumniCareer.nim == nim).first()
    if not career:
        career = AlumniCareer(nim=nim)
        db.add(career)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(career, field, value)

    db.commit()
    db.refresh(career)

    log_action(
        db, current_user, "UPDATE_CAREER", f"/alumni/{nim}/career",
        detail=str(payload.model_dump(exclude_unset=True)),
        ip_address=request.client.host if request.client else None,
    )
    return {"message": "Data karier berhasil diperbarui.", "nim": nim}


# ─── GET /alumni/stats/dashboard ─────────────────────────────────────────────

@router.get("/stats/dashboard", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(func.count(AlumniBase.id)).scalar() or 0
    with_contact = db.query(func.count(AlumniContact.id)).scalar() or 0
    with_career = db.query(func.count(AlumniCareer.id)).scalar() or 0

    pct_contact = round((with_contact / total * 100), 1) if total > 0 else 0.0
    pct_career = round((with_career / total * 100), 1) if total > 0 else 0.0

    # Alumni per tahun lulus
    per_tahun_raw = (
        db.query(func.extract("year", AlumniBase.tgl_lulus).label("tahun"), func.count(AlumniBase.id))
        .filter(AlumniBase.tgl_lulus != None)
        .group_by("tahun")
        .order_by("tahun")
        .all()
    )
    per_tahun = {str(int(r[0])): r[1] for r in per_tahun_raw if r[0]}

    # Alumni per fakultas
    per_fakultas_raw = (
        db.query(AlumniBase.fakultas, func.count(AlumniBase.id))
        .filter(AlumniBase.fakultas != None)
        .group_by(AlumniBase.fakultas)
        .order_by(func.count(AlumniBase.id).desc())
        .all()
    )
    per_fakultas = {r[0]: r[1] for r in per_fakultas_raw if r[0]}

    return DashboardStats(
        total_alumni=total,
        with_contact=with_contact,
        with_career=with_career,
        pct_contact=pct_contact,
        pct_career=pct_career,
        per_tahun=per_tahun,
        per_fakultas=per_fakultas,
    )
