import sys
import os

# 1. Setup Path (Harus paling atas)
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# 2. Import app secara langsung tanpa 'try' block di baris ini
# Agar scanner Vercel bisa menemukannya dengan mudah
from app.main import app

# Ini hanya untuk memastikan variabel 'app' tersedia bagi scanner
handler = app
