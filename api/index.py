import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# 1. Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

app = FastAPI()

try:
    # 2. Coba import app utama
    from app.main import app as real_app
    app.mount("/", real_app)
except Exception as e:
    # 3. Jika gagal, LAPORKAN DETILNYA
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def report_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "CRITICAL_ERROR",
                "message": str(e),
                "trace": traceback.format_exc(),
                "cwd": os.getcwd(),
                "path": sys.path
            }
        )
