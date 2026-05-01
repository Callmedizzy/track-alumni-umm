import os
from pydantic_settings import BaseSettings

def get_db_url():
    import shutil
    db_name = "alumni_dev.db"
    
    # Lokasi file DB asli (bundled by Vercel)
    locations = [
        os.path.join(os.getcwd(), db_name),
        os.path.join(os.getcwd(), "backend", db_name),
        "/var/task/alumni_dev.db",
        "/var/task/backend/alumni_dev.db"
    ]
    
    original_db = None
    for loc in locations:
        if os.path.exists(loc):
            original_db = loc
            break
            
    if os.environ.get("VERCEL") and original_db:
        # Vercel file system is read-only except for /tmp
        tmp_db = "/tmp/alumni_dev.db"
        if not os.path.exists(tmp_db):
            try:
                shutil.copy2(original_db, tmp_db)
            except Exception:
                pass
        return f"sqlite:///{tmp_db}"
        
    if original_db:
        path = os.path.abspath(original_db).replace("\\", "/")
        if not path.startswith("/"): path = "/" + path
        return f"sqlite:////{path}"
        
    # Default fallback
    return "sqlite:///./alumni_dev.db"

class Settings(BaseSettings):
    SECRET_KEY: str = "umm-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    @property
    def DATABASE_URL(self) -> str:
        return get_db_url()

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
