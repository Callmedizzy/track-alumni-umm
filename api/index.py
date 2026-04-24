import sys
import os

# 1. Tambahkan folder backend ke path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# 2. Import aplikasi asli (FastAPI)
try:
    from app.main import app
except ImportError:
    # Jika gagal karena alasan aneh, buat app kosong agar tidak 500
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/api/health")
    def health(): return {"status": "waiting for backend"}
