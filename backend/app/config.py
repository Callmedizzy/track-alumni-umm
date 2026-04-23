import os
from pydantic_settings import BaseSettings
from typing import Optional

# Otomatis mencari lokasi database di folder backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_URL = f"sqlite:///{os.path.join(BASE_DIR, 'alumni_dev.db')}"

class Settings(BaseSettings):
    DATABASE_URL: str = DEFAULT_DB_URL
    SECRET_KEY: str = "change-this-to-a-very-long-random-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 8

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
