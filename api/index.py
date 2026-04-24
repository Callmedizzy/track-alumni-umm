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

@app.get("/api/diagnostics")
def diagnostics():
    return {
        "cwd": os.getcwd(),
        "base_dir": base_dir,
        "ls_root": os.listdir("."),
        "ls_backend": os.listdir("backend") if os.path.exists("backend") else "NOT_FOUND",
        "db_exists": os.path.exists(os.path.join(backend_path, "alumni_dev.db"))
    }

try:
    # Coba impor aplikasi utama (Hati-hati: ini mungkin crash jika bcrypt masih nyangkut di cache)
    from app.main import app as real_app
    app.mount("/", real_app)
except Exception as e:
    import traceback
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_error(path: str):
        return JSONResponse(status_code=500, content={"error": str(e), "trace": traceback.format_exc()})
