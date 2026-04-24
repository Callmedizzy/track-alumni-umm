import os
import shutil
from pydantic_settings import BaseSettings

def get_db_path():
    # 1. Tentukan lokasi asli database (Pastikan path-nya benar di Vercel)
    # Di Vercel, root proyek biasanya ada di /var/task
    base_dir = os.getcwd()
    original_db = os.path.join(base_dir, "backend", "alumni_dev.db")
    
    # 2. Lokasi tujuan di /tmp
    temp_db = "/tmp/alumni_dev.db"
    
    if os.environ.get("VERCEL"):
        try:
            # Salin database ke /tmp agar bisa diakses
            if os.path.exists(original_db):
                shutil.copy2(original_db, temp_db)
                # Gunakan 3-slash untuk sqlite absolute path di Linux
                return f"sqlite:///{temp_db}"
            else:
                # Jika tidak ketemu di backend/, coba di root
                root_db = os.path.join(base_dir, "alumni_dev.db")
                if os.path.exists(root_db):
                    shutil.copy2(root_db, temp_db)
                    return f"sqlite:///{temp_db}"
        except Exception as e:
            print(f"Database Copy Error: {e}")
            
    # Fallback untuk lokal atau jika gagal
    return f"sqlite:///{original_db}"

class Settings(BaseSettings):
    DATABASE_URL: str = get_db_path()
    SECRET_KEY: str = "change-this-to-a-very-long-random-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 8

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
