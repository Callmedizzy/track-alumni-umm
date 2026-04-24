# Vercel Deployment Trigger - Python 3.12
import sys
import os

# Menambahkan folder 'backend' ke sys.path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# Import aplikasi secara eksplisit
from app.main import app as _app

# Pastikan variabel 'app' terbaca jelas oleh Vercel
app = _app

