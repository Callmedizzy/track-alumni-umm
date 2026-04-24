import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# 1. Deklarasikan 'app' di baris paling luar agar Vercel PASTI menemukannya
app = FastAPI()

# 2. Tambahkan folder backend ke path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# 3. Import aplikasi asli
try:
    from app.main import app as real_app
    # Sambungkan aplikasi asli ke 'app' utama
    app.mount("/", real_app)
except Exception as e:
    # Jika backend error, jangan buat Vercel build gagal, tampilkan saja errornya
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path: str):
        return JSONResponse(status_code=500, content={"error": "Backend offline", "detail": str(e)})
