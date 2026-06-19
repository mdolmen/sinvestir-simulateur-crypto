"""Shared FastAPI dependencies."""

from __future__ import annotations

from prices.base import PriceSource
from prices.yahoo import YahooPriceSource


def get_price_source() -> PriceSource:
    """Production price source — overridable in tests via dependency_overrides."""
    return YahooPriceSource()
