import sys
import os

# Add the parent directory (backend) to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
