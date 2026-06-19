"""Price layer tests: CSV loader and yfinance normalization (mocked, no network)."""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pandas as pd

from prices.csv import CsvPriceSource, load_price_csv
from prices.yahoo import normalize

FIXTURE = Path(__file__).parent / "fixtures" / "xrp_eur_daily.csv"


def test_load_price_csv_yields_sorted_named_series() -> None:
    series = load_price_csv(FIXTURE)
    assert series.name == "close"
    assert isinstance(series.index, pd.DatetimeIndex)
    assert series.index.is_monotonic_increasing
    assert series.loc[pd.Timestamp("2026-06-19")] == 0.9843


def test_csv_price_source_implements_fetch() -> None:
    source = CsvPriceSource(FIXTURE)
    series = source.fetch("XRP", "eur", date(2018, 1, 1), date(2018, 1, 31))
    assert not series.empty


def test_normalize_drops_tz_and_keeps_close() -> None:
    index = pd.DatetimeIndex(
        ["2020-01-02 00:00:00+00:00", "2020-01-01 00:00:00+00:00"], tz="UTC"
    )
    frame = pd.DataFrame({"Open": [1.0, 2.0], "Close": [10.0, 20.0]}, index=index)
    series = normalize(frame)
    assert series.name == "close"
    assert isinstance(series.index, pd.DatetimeIndex)
    assert series.index.tz is None
    assert series.index.is_monotonic_increasing
    assert series.loc[pd.Timestamp("2020-01-01")] == 20.0


def test_normalize_handles_empty_frame() -> None:
    series = normalize(pd.DataFrame())
    assert series.empty
    assert series.name == "close"
