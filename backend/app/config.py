import os
from pydantic_settings import BaseSettings

def get_db_url():
    db_name = "alumni_dev.db"
    
    # Daftar semua kemungkinan lokasi file di server Vercel
    possible_paths = [
        f"/var/task/backend/{db_name}",
        f"/var/task/{db_name}",
        os.path.join(os.getcwd(), "backend", db_name),
        os.path.join(os.getcwd(), db_name),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", db_name)),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_name))
    ]
    
    found_path = None
    for p in possible_paths:
        if os.path.exists(p):
            found_path = p
            break
            
    if found_path:
        # Gunakan mode Read-Only yang sangat stabil
        abs_p = found_path.replace("\\", "/")
        if not abs_p.startswith("/"): abs_p = "/" + abs_p
        return f"sqlite:////{abs_p}?check_same_thread=False&mode=ro"
    
    # Jika benar-benar tidak ketemu, lapor ke log
    print("DEBUG: DATABASE FILE NOT FOUND IN ANY SEARCH PATH!")
    return "sqlite:///./alumni_dev.db"

class Settings(BaseSettings):
    DATABASE_URL: str = get_db_url()
    SECRET_KEY: str = "umm-alumni-tracker-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
