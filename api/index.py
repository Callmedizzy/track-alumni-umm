import sys
import os
from fastapi import FastAPI

# 1. Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# 2. Import app asli
try:
    from app.main import app
except Exception as e:
    from fastapi.responses import JSONResponse
    import traceback
    
    # Emergency app jika masih gagal import
    fallback_app = FastAPI()
    @fallback_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_err(path: str):
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})
    app = fallback_app
