"""Yahoo Finance price source via yfinance — unofficial API, isolated here (§7)."""

from __future__ import annotations

import re
from datetime import date, timedelta

import pandas as pd
import yfinance as yf

from prices.base import CoinMatch

# Trailing quote-currency word in Yahoo's shortName, e.g. "Bitcoin EUR" -> "Bitcoin".
_CURRENCY_SUFFIX = re.compile(
    r"\s+(USD|EUR|CAD|GBP|JPY|CNY|AUD|CHF|INR|KRW|BRL)$", re.IGNORECASE
)
_SEARCH_COUNT = 50  # Yahoo lookup window; deduped down to distinct base symbols.
_SEARCH_LIMIT = 20  # max coins returned to the picker.
_DEFAULT_QUERY = "USD"  # broad lookup that returns the major coins (empty-state list).


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

    def search_coins(self, query: str, currency: str) -> list[CoinMatch]:
        # Empty query → broad default lookup so the picker opens with major coins.
        term = query.strip() or _DEFAULT_QUERY
        frame = yf.Lookup(term).get_cryptocurrency(count=_SEARCH_COUNT)
        matches: list[CoinMatch] = []
        seen: set[str] = set()
        for symbol, row in frame.iterrows():
            base = str(symbol).split("-")[0]
            if base in seen:
                continue
            seen.add(base)
            raw_name = str(row.get("shortName", base))
            name = _CURRENCY_SUFFIX.sub("", raw_name).strip() or base
            matches.append(CoinMatch(symbol=base, name=name))
            if len(matches) >= _SEARCH_LIMIT:
                break
        return matches
