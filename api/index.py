import sys
import os
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

try:
    # Import aplikasi asli
    from app.main import app
    
    # KUNCI UTAMA: Tangkap SEMUA error saat aplikasi berjalan
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"RUNTIME_ERROR: {str(exc)}",
                "trace": traceback.format_exc(),
                "cwd": os.getcwd()
            }
        )
except Exception as e:
    # Tangkap SEMUA error saat aplikasi baru menyala
    app = FastAPI()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def boot_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"BOOT_ERROR: {str(e)}",
                "trace": traceback.format_exc()
            }
        )
