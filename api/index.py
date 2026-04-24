import sys
import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/test")
def test_connection():
    return {
        "status": "Python is ALIVE",
        "working_dir": os.getcwd(),
        "python_version": sys.version
    }

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(path: str):
    return JSONResponse(
        content={
            "message": "Test mode active",
            "path_accessed": path
        }
    )
