"""Vercel Python entrypoint — exposes the FastAPI ASGI app for the @vercel/python runtime."""

from app.main import app

__all__ = ["app"]
