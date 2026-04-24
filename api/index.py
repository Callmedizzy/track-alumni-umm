import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

app = FastAPI()

@app.get("/api/test")
def test_connection():
    return {"status": "Python is ALIVE", "cwd": os.getcwd()}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def debug_route(path: str):
    report = []
    try:
        report.append("Testing imports...")
        import sqlalchemy
        report.append(f"SQLAlchemy loaded: {sqlalchemy.__version__}")
        
        import bcrypt
        report.append("Bcrypt loaded successfully")
        
        from app.config import settings
        report.append(f"Settings loaded. DB_URL: {settings.DATABASE_URL}")
        
        from app.database import engine
        report.append("Database engine created")
        
        from app.main import app as real_app
        report.append("Main app imported successfully!")
        
        return JSONResponse(content={
            "status": "SUCCESS",
            "report": report,
            "message": "If you see this, the app should be working. Try visiting the home page."
        })
        
    except Exception as e:
        import traceback
        return JSONResponse(
            status_code=500,
            content={
                "status": "CRASHED",
                "at_step": report[-1] if report else "start",
                "error": str(e),
                "traceback": traceback.format_exc(),
                "report_so_far": report
            }
        )
