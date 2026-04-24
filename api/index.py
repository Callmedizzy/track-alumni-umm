import sys
import os

# 1. Setup Path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if path not in sys.path:
    sys.path.insert(0, path)

# 2. Export app utama langsung di level atas
from app.main import app
