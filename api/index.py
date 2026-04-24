# Vercel Deployment Trigger - Python 3.12
import sys
import os

# Menambahkan folder 'backend' ke sys.path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

try:
    from app.main import app as _app
except Exception as e:
    import traceback
    print("CRITICAL: Failed to load application")
    traceback.print_exc()
    raise e

# Robot Vercel HARUS melihat ini di tingkat paling luar file
app = _app

