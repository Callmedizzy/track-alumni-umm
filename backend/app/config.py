import os
import shutil
from pydantic_settings import BaseSettings
from typing import Optional

def get_db_url():
    # Lokasi database di dalam repo
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_name = "alumni_dev.db"
    
    # Coba cari di beberapa tempat
    possible_locations = [
        os.path.join(base_dir, db_name),
        os.path.join(os.getcwd(), "backend", db_name),
        os.path.join(os.getcwd(), db_name)
    ]
    
    source_db = None
    for loc in possible_locations:
        if os.path.exists(loc):
            source_db = loc
            break
            
    # Jika di Vercel, kita salin ke /tmp agar aman
    if os.environ.get("VERCEL") and source_db:
        target_db = f"/tmp/{db_name}"
        try:
            if not os.path.exists(target_db):
                shutil.copy2(source_db, target_db)
            # PENTING: Gunakan 4 garis miring untuk path absolut di SQLite
            return f"sqlite:////{target_db}"
        except Exception as e:
            print(f"Gagal menyalin ke /tmp: {e}")
            
    if source_db:
        # Gunakan 4 garis miring untuk path absolut
        abs_path = os.path.abspath(source_db).replace("\\", "/")
        return f"sqlite:////{abs_path}"
    
    # Fallback terakhir (jika benar-benar tidak ketemu)
    return "sqlite:///./alumni_dev.db"

class Settings(BaseSettings):
    # Gunakan default URL yang sudah kita proses
    DATABASE_URL: str = get_db_url()
    SECRET_KEY: str = "change-this-to-a-very-long-random-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 8

    class Config:
        # Jangan paksa cari .env jika tidak ada
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore" # Biarkan jika ada variabel tambahan

settings = Settings()
