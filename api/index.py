import sys
import os

# 1. Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# 2. Langsung import app
try:
    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    import traceback
    app = FastAPI()
    @app.get("/{path:path}")
    async def error(path: str):
        return JSONResponse(content={"error": str(e), "trace": traceback.format_exc()})
