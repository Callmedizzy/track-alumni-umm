import sys
import os

# 1. Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# 2. Langsung import app asli
# Vercel akan membaca variabel 'app' ini sebagai handler utama
from app.main import app
