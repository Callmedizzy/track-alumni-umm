import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

# Setup Path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(base_dir, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

@app.get("/api/hello")
def hello():
    return {"status": "Sistem Hidup Tanpa Venv!", "cwd": os.getcwd()}

try:
    from app.main import app as real_app
    app.mount("/", real_app)
except Exception as e:
    import traceback
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_error(path: str):
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})
