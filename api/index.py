import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Buat instance app di level paling atas
app = FastAPI()

# Cari lokasi folder 'backend' secara dinamis
# Kita asumsikan folder 'backend' ada di folder utama proyek
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(base_dir, 'backend')

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

@app.get("/api/test")
def test_info():
    return {
        "status": "ALIVE",
        "sys_path": sys.path,
        "base_dir": base_dir,
        "backend_exists": os.path.exists(backend_path)
    }

try:
    # Coba muat aplikasi asli
    from app.main import app as real_app
    # Gunakan mount agar pathing internal FastAPI tetap aman
    app.mount("/", real_app)
except Exception as e:
    import traceback
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all_error(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Startup Failed",
                "detail": str(e),
                "traceback": traceback.format_exc(),
                "path_tried": backend_path
            }
        )
