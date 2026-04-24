import sys
import os

# Tambahkan backend ke system path agar imports 'app' berfungsi
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
