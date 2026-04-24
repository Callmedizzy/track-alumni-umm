from fastapi import FastAPI

app = FastAPI()

@app.get("/api/hello")
def hello():
    return {"message": "Sistem Hidup!", "status": "OK"}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(path: str):
    return {"message": f"Anda mengakses rute: {path}", "info": "Mode minimalis aktif"}
