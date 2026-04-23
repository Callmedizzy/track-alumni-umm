import sys
import os

# Menambahkan folder backend ke path agar python bisa menemukan package 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

# Vercel butuh app instance yang diexpose
# Karena app sudah diimport dari app.main, maka sudah siap.
