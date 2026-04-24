import os
from pydantic_settings import BaseSettings

def get_db_url():
    db_name = "alumni_dev.db"
    
    # Lokasi file di Vercel (Root folder)
    # Kita cari file tersebut secara absolut
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    source_db = os.path.join(base_dir, "backend", db_name)
    
    if not os.path.exists(source_db):
        # Fallback jika struktur foldernya berbeda
        source_db = os.path.join(os.getcwd(), "backend", db_name)

    if os.path.exists(source_db):
        abs_path = os.path.abspath(source_db).replace("\\", "/")
        # GUNAKAN MODE READ-ONLY (?mode=ro) agar sangat cepat dan tidak butuh izin tulis
        return f"sqlite:////{abs_path}?mode=ro"
    
    return "sqlite:///./alumni_dev.db"

class Settings(BaseSettings):
    DATABASE_URL: str = get_db_url()
    SECRET_KEY: str = "super-secret-key-umm"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
