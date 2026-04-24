import os
import shutil
from pydantic_settings import BaseSettings

def get_db_url():
    db_name = "alumni_dev.db"
    
    # 1. Cari file aslinya di folder backend
    # Vercel biasanya meletakkan file di /var/task atau CWD
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    source_db = os.path.join(current_dir, db_name)
    
    if not os.path.exists(source_db):
        # Coba cari di root (satu level di atas backend)
        source_db = os.path.join(os.path.dirname(current_dir), db_name)
        
    if not os.path.exists(source_db):
        # Coba cari di folder backend dari root
        source_db = os.path.join(os.getcwd(), "backend", db_name)

    # 2. Jika di Vercel, salin ke /tmp (KARENA /var/task itu Read-Only)
    if os.environ.get("VERCEL") and os.path.exists(source_db):
        target_db = f"/tmp/{db_name}"
        try:
            # Selalu salin ulang agar data terbaru
            shutil.copy2(source_db, target_db)
            return f"sqlite:////{target_db}"
        except Exception as e:
            print(f"Gagal copy: {e}")
            return f"sqlite:////{source_db}" # Paksa baca langsung jika copy gagal
            
    if os.path.exists(source_db):
        abs_path = os.path.abspath(source_db).replace("\\", "/")
        return f"sqlite:////{abs_path}"
    
    return "sqlite:///./alumni_dev.db"

class Settings(BaseSettings):
    DATABASE_URL: str = get_db_url()
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
