import sys
import os
from fastapi import FastAPI

# Tambahkan folder backend ke path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# Import aplikasi asli
from app.main import app
