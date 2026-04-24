from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse
from app.security import (
    create_access_token,
    get_password_hash,
    log_action,
    verify_password,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    try:
        # Cek apakah kita bisa melakukan query sederhana ke database
        user = db.query(User).filter(User.username == payload.username).first()
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=500,
            detail=f"Gagal akses database: {str(e)}. Pastikan file database ada dan valid."
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User '{payload.username}' tidak ditemukan di database.",
        )

    # Verifikasi Password dengan pelindung
    is_valid = False
    try:
        is_valid = verify_password(payload.password, user.password_hash)
    except HTTPException as e:
        raise e # Teruskan error dari security.py
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal verifikasi password: {str(e)}"
        )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password salah.",
        )

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS),
    )

    # log_action sekarang aman karena sudah kita proteksi di security.py
    log_action(
        db,
        user=user,
        action="LOGIN",
        resource="/auth/login",
        detail="Login berhasil",
        ip_address=request.client.host if request.client else None,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        username=user.username,
    )
