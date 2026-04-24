import sys
import os
from fastapi import FastAPI

# 1. DEFINISI DI LEVEL ATAS (Agar robot Vercel senang)
app = FastAPI()

# 2. Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

try:
    # 3. Load aplikasi asli
    from app.main import app as real_app
    app = real_app
except Exception as e:
    # 4. Jika gagal load, kita biarkan 'app' yang di atas tadi menangkap error-nya
    from fastapi.responses import JSONResponse
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
