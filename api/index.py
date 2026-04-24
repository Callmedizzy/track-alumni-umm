import sys
import os

# Tambahkan folder backend ke path agar modul 'app' bisa ditemukan
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# Import app asli dari backend/app/main.py
try:
    from app.main import app
except Exception as e:
    # Fallback jika gagal import, agar robot Vercel tidak error saat build
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/api/error")
    def error():
        return {"error": str(e)}
