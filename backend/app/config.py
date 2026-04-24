import os
import shutil
from pydantic_settings import BaseSettings
from typing import Optional

def get_db_path():
    # Lokasi asli database di dalam folder backend
    original_db = os.path.join(os.getcwd(), "backend", "alumni_dev.db")
    
    # Jika kita di Vercel, kita salin ke /tmp agar bisa dibaca/tulis tanpa kendala
    if os.environ.get("VERCEL"):
        temp_db = "/tmp/alumni_dev.db"
        try:
            if os.path.exists(original_db):
                # Salin file jika belum ada di /tmp
                if not os.path.exists(temp_db):
                    shutil.copy2(original_db, temp_db)
                return f"sqlite:///{temp_db}"
        except Exception as e:
            print(f"Gagal menyalin database: {e}")
            
    return f"sqlite:///{original_db}"

DEFAULT_DB_URL = get_db_path()

class Settings(BaseSettings):
    DATABASE_URL: str = DEFAULT_DB_URL
    SECRET_KEY: str = "change-this-to-a-very-long-random-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 8

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
