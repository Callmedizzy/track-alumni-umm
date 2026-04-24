import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database import engine
from app.models import Base
from app.routers import auth, alumni, admin

# ─── Rate Limiter ─────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Buat tabel database saat startup (Hanya jika TIDAK di Vercel)
    if not os.environ.get("VERCEL"):
        Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="Alumni Tracker API",
    description="REST API untuk Sistem Manajemen Data Alumni Universitas Muhammadiyah Malang",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# DEBUG: Tangkap semua error dan kirim ke browser agar bisa kita lihat penyebabnya
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error - Debug Mode",
            "detail": str(exc),
            "traceback": traceback.format_exc()
        }
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api")
app.include_router(alumni.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "environment": "vercel" if os.environ.get("VERCEL") else "local"}

@app.get("/api/debug/files")
def list_files():
    import os
    files = []
    for root, dirs, filenames in os.walk("."):
        for f in filenames:
            files.append(os.path.join(root, f))
    return {
        "cwd": os.getcwd(),
        "files_count": len(files),
        "backend_files": [f for f in files if "backend" in f][:100], # Ambil 100 pertama saja
        "db_exists": os.path.exists("backend/alumni_dev.db") or os.path.exists("alumni_dev.db")
    }
