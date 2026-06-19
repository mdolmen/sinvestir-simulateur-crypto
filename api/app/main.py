"""FastAPI entrypoint. Exposes the simulation API (health for now)."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="S'investir Crypto Simulator API")


class Health(BaseModel):
    status: str


@app.get("/health")
def health() -> Health:
    """Liveness probe."""
    return Health(status="ok")
