import os
from pydantic_settings import BaseSettings

def get_db_url():
    db_name = "alumni_dev.db"
    
    # CARA PALING SIMPEL: Cari di folder utama atau folder backend
    # Kita coba beberapa lokasi yang paling umum di Vercel
    locations = [
        os.path.join(os.getcwd(), db_name),
        os.path.join(os.getcwd(), "backend", db_name),
        "/var/task/alumni_dev.db",
        "/var/task/backend/alumni_dev.db"
    ]
    
    for loc in locations:
        if os.path.exists(loc):
            # LANGSUNG BUKA! Jangan pakai copy-copy lagi agar tidak berat.
            # Mode 'ro' (Read-Only) sangat ringan.
            path = os.path.abspath(loc).replace("\\", "/")
            if not path.startswith("/"): path = "/" + path
            return f"sqlite:////{path}?mode=ro"
            
    # Jika masih tidak ketemu (kritis), gunakan default
    return "sqlite:///./alumni_dev.db"

class Settings(BaseSettings):
    DATABASE_URL: str = get_db_url()
    SECRET_KEY: str = "umm-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
