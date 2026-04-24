import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# 1. Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# 2. DEFINISI TOP-LEVEL
app = FastAPI()

try:
    # 3. Muat aplikasi asli (Tanpa Bcrypt karena sudah kita hapus di security.py)
    from app.main import app as real_app
    app.mount("/", real_app)
except Exception as e:
    import traceback
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def bootstrap_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "BOOTSTRAP_ERROR",
                "message": str(e),
                "traceback": traceback.format_exc()
            }
        )
