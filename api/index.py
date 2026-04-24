import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# PENTING: Harus ada di level atas agar Vercel tidak error build
app = FastAPI()

# Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

try:
    # Coba impor aplikasi utama
    from app.main import app as real_app
    # Tempelkan ke app utama kita
    app.mount("/", real_app)
except Exception as e:
    import traceback
    error_msg = str(e)
    stack = traceback.format_exc()
    
    @app.get("/{path:path}")
    async def catch_all_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "CRASH_ON_IMPORT",
                "message": error_msg,
                "traceback": stack,
                "sys_path": sys.path
            }
        )
