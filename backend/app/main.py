import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.database import engine
from app.models import Base
from app.routers import auth, alumni, admin

# ─── Rate Limiter ─────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address)


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (use Alembic in production)
    if not os.environ.get("VERCEL"):
        Base.metadata.create_all(bind=engine)
    yield


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Alumni Tracker API",
    description="REST API untuk Sistem Manajemen Data Alumni Universitas Muhammadiyah Malang",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://[::1]:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://[::1]:3000",
    ],
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
    return {"status": "ok", "service": "Alumni Tracker API v1.0"}
