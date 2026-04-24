import sys
import os

# Menambahkan folder 'backend' ke sys.path agar 'from app.main import app' berfungsi
# Vercel menaruh kode di /var/task pada saat runtime
path = os.path.join(os.getcwd(), "backend")
if path not in sys.path:
    sys.path.insert(0, path)

try:
    from app.main import app
except Exception as e:
    # Log error agar muncul di dashboard Vercel
    print(f"FAILED TO LOAD APP: {e}")
    raise e

