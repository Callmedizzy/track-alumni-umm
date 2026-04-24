# Vercel Deployment Trigger - Database Diagnostics
import sys
import os

# Menambahkan folder 'backend' ke sys.path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

try:
    # 1. Diagnostik Database sebelum load app
    # Kita import manual karena app.config butuh sys.path sudah siap
    from app.config import DEFAULT_DB_URL
    db_path = DEFAULT_DB_URL.replace("sqlite:///", "")
    
    # 2. Cek apakah file ada
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"Database file NOT FOUND at: {db_path}")
    
    # 3. Tes koneksi SQLite
    import sqlite3
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    conn.close()
    
    if not tables:
        raise ValueError(f"Database at {db_path} is EMPTY (no tables found)")

    # 4. Jika semua oke, baru load app asli
    from app.main import app as _app
    app = _app

except Exception as e:
    import traceback
    # Jika terjadi error saat startup, kita buat "App Darurat" 
    # agar pesan error-nya bisa dibaca di browser (Network Tab)
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    emergency_app = FastAPI()
    
    @emergency_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_bootstrap_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "BOOTSTRAP_ERROR",
                "message": str(e),
                "traceback": traceback.format_exc(),
                "cwd": os.getcwd(),
                "db_path_attempted": db_path if 'db_path' in locals() else "unknown"
            }
        )
    app = emergency_app
