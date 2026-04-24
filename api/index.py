# Vercel Deployment Trigger - v1.1
import sys
import os

# Get the absolute path of the current file's directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Root directory is one level up from 'api/'
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
# Backend directory
backend_dir = os.path.join(root_dir, "backend")

# Add backend to sys.path so 'import app' works
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except ImportError as e:
    print(f"ImportError: {e}")
    print(f"Current sys.path: {sys.path}")
    print(f"Backend dir: {backend_dir}")
    raise e

