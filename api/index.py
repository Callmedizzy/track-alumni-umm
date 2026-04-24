import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

# Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

@app.get("/api/debug/import")
def debug_imports():
    import_status = []
    try:
        import_status.append("Mencoba import sqlalchemy...")
        import sqlalchemy
        import_status.append("Berhasil import sqlalchemy")
        
        import_status.append("Mencoba import pydantic...")
        import pydantic
        import_status.append("Berhasil import pydantic")
        
        import_status.append("Mencoba import bcrypt...")
        import bcrypt
        import_status.append("Berhasil import bcrypt")
        
        import_status.append("Mencoba import jose...")
        from jose import jwt
        import_status.append("Berhasil import jose (jwt)")
        
        import_status.append("Mencoba import app.main...")
        from app.main import app as real_app
        import_status.append("Berhasil import app.main!")
        
        return {"status": "ALL_OK", "history": import_status}
    except Exception as e:
        return {"status": "FAILED", "at": import_status[-1], "error": str(e), "history": import_status}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(path: str):
    return JSONResponse(content={"message": "Gunakan /api/debug/import untuk pengecekan"})
