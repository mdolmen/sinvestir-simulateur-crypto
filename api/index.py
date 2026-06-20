"""Vercel Python entrypoint — exposes the FastAPI ASGI app for the @vercel/python runtime."""

import sys
from pathlib import Path

# On Vercel the function runs from the repo root (/var/task); make the api/
# directory importable as the package root so `app` resolves. Locally uvicorn
# already runs with cwd=api, so this is a no-op there.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import app  # noqa: E402  (import after sys.path setup)

__all__ = ["app"]
