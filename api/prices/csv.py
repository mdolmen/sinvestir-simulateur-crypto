"""CSV price loader — backs the deterministic fixtures (golden test, offline use)."""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pandas as pd


def load_price_csv(path: str | Path) -> pd.Series[float]:
    """Load a `date,close` CSV into an ascending close series indexed by date."""
    frame = pd.read_csv(path, index_col="date", parse_dates=["date"])
    close = frame["close"].sort_index()
    close.name = "close"
    return close


class CsvPriceSource:
    """A PriceSource backed by a CSV fixture — deterministic, no network."""

    def __init__(self, path: str | Path) -> None:
        self._series = load_price_csv(path)

    def fetch(self, coin: str, currency: str, start: date, end: date) -> pd.Series[float]:
        return self._series
