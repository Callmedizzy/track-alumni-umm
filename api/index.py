import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

# Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

@app.get("/api/v2/debug")
def debug():
    results = []
    try:
        results.append("Mencoba import sqlalchemy...")
        import sqlalchemy
        results.append("OK")
        
        results.append("Mencoba import pydantic...")
        import pydantic
        results.append("OK")
        
        results.append("Mencoba import jose.jwt...")
        from jose import jwt
        results.append("OK")
        
        results.append("Mencoba import app.database...")
        from app.database import engine
        results.append("OK")
        
        results.append("Mencoba import app.main...")
        from app.main import app as real_app
        results.append("OK - SEMUA BERHASIL!")
        
        return {"status": "SUCCESS", "history": results}
    except Exception as e:
        return {"status": "FAILED", "at": results[-1], "error": str(e)}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(path: str):
    return {"message": "Gunakan /api/v2/debug untuk cek kesehatan server"}
