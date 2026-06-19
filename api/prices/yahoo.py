"""Yahoo Finance price source via yfinance — unofficial API, isolated here (§7)."""

from __future__ import annotations

from datetime import date, timedelta

import pandas as pd
import yfinance as yf


def normalize(frame: pd.DataFrame) -> pd.Series[float]:
    """yfinance OHLC frame -> ascending daily close series indexed by naive date."""
    if frame.empty or "Close" not in frame.columns:
        return pd.Series(dtype="float64", name="close")
    close = frame["Close"].copy()
    index = pd.DatetimeIndex(close.index)
    if index.tz is not None:
        index = index.tz_localize(None)
    close.index = index.normalize()
    close.index.name = "date"
    close.name = "close"
    return close.sort_index()


class YahooPriceSource:
    """Fetches daily closes for the `{COIN}-{CURRENCY}` ticker from Yahoo Finance."""

    def fetch(self, coin: str, currency: str, start: date, end: date) -> pd.Series[float]:
        ticker = f"{coin.upper()}-{currency.upper()}"
        # yfinance's `end` is exclusive -> add one day to include the end date.
        frame = yf.Ticker(ticker).history(
            start=start.isoformat(),
            end=(end + timedelta(days=1)).isoformat(),
            interval="1d",
        )
        return normalize(frame)
