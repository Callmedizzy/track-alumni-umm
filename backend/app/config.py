import os
from pydantic_settings import BaseSettings
from typing import Optional

# Mencari lokasi database dengan sangat kuat (Universal Vercel Path)
def get_db_path():
    # Coba beberapa lokasi yang mungkin di Vercel
    possible_paths = [
        os.path.join(os.getcwd(), "backend", "alumni_dev.db"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "alumni_dev.db"),
        os.path.join("/var/task", "backend", "alumni_dev.db"),
        "alumni_dev.db" # Fallback terakhir
    ]
    
    for p in possible_paths:
        if os.path.exists(p):
            return f"sqlite:///{p}"
            
    # Jika tidak ketemu, gunakan default (akan error tapi setidaknya kita tahu)
    return f"sqlite:///{os.path.join(os.getcwd(), 'backend', 'alumni_dev.db')}"

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
