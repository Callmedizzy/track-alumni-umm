from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/api/auth/login")
async def manual_login():
    # BYPASS TOTAL: Langsung berikan token sukses
    return {
        "access_token": "emergency_bypass_token",
        "token_type": "bearer",
        "role": "admin",
        "username": "admin"
    }

@app.get("/api/alumni")
async def mock_alumni():
    return []

@app.get("/api/test-nyawa")
def test():
    return {"status": "Aplikasi Hidup Tanpa Beban!"}
