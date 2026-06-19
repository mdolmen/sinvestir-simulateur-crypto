"""PriceSource abstraction — isolates the price provider from the engine/route."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Protocol

import pandas as pd


@dataclass(frozen=True)
class CoinMatch:
    """A coin returned by a search: base symbol + display name."""

    symbol: str
    name: str


class PriceSource(Protocol):
    """A source of daily close prices for a coin in a given currency."""

    def fetch(self, coin: str, currency: str, start: date, end: date) -> pd.Series[float]:
        """Daily close prices indexed by date (ascending) covering [start, end].

        Returns an empty series when the coin/currency pair is unknown.
        """
        ...

    def search_coins(self, query: str, currency: str) -> list[CoinMatch]:
        """Coins matching `query`, deduplicated by base symbol (best match first)."""
        ...
