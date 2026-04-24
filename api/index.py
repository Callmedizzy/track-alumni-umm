import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

app = FastAPI()

try:
    # Coba jalankan mesin utama
    from app.main import app as real_app
    app.mount("/", real_app)
except Exception as e:
    # JIKA CRASH, TAMPILKAN PENYEBABNYA SECARA GAMBLANG
    error_info = traceback.format_exc()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def error_reporter(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "SERVER_CRASH_DURING_BOOT",
                "error": str(e),
                "traceback": error_info,
                "current_working_dir": os.getcwd(),
                "files_in_root": os.listdir('.')
            }
        )
