"""FastAPI entrypoint. Exposes the simulation API (health for now)."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

from app.simulate import router as simulate_router

app = FastAPI(title="S'investir Crypto Simulator API")

app.include_router(simulate_router)


class Health(BaseModel):
    status: str


@app.get("/api/health")
def health() -> Health:
    """Liveness probe."""
    return Health(status="ok")
