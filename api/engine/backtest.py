"""Pure DCA backtest over a daily price series — no I/O (docs/ARCHITECTURE.md §5).

The engine receives a pandas price series (close indexed by date) plus the
simulation parameters and returns the contract outputs. The price for a payment
date is the last known close on or before that date (forward-fill).
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date
from typing import cast

import pandas as pd

from engine.schedule import Frequency, build_schedule


@dataclass(frozen=True)
class SeriesPoint:
    """A point of the portfolio time series: cumulative invested vs. value."""

    date: date
    invested: float
    value: float


@dataclass(frozen=True)
class BacktestResult:
    periods: int
    invested: float
    units: float
    avg_price: float
    final_value: float
    gains: float
    performance: float
    series: list[SeriesPoint]


def _price_on_or_before(prices: pd.Series[float], when: date) -> float | None:
    """Last known close on or before `when` (forward-fill), or None if `when`
    precedes the coin's first available price."""
    price = float(cast(float, prices.asof(pd.Timestamp(when))))
    return None if math.isnan(price) or price <= 0 else price


def run_backtest(
    prices: pd.Series[float],
    *,
    amount: float,
    frequency: Frequency,
    start: date,
    end: date,
) -> BacktestResult:
    """Run a once/DCA backtest and compute the §4 contract outputs.

    Payment dates that fall before the coin's first available price buy nothing
    (the period is padded with zeros) rather than failing, so a start date older
    than the listing is allowed; `periods`/`invested` count realized payments only.
    """
    if amount < 0:
        raise ValueError("amount must be non-negative")

    schedule = build_schedule(start, end, frequency)

    cumulative_units = 0.0
    invested = 0.0
    periods = 0
    series: list[SeriesPoint] = []
    for when in schedule:
        price = _price_on_or_before(prices, when)
        if price is None:
            # Before the coin existed: nothing is invested, holdings stay empty.
            series.append(SeriesPoint(date=when, invested=invested, value=0.0))
            continue
        cumulative_units += amount / price
        invested += amount
        periods += 1
        series.append(
            SeriesPoint(date=when, invested=invested, value=cumulative_units * price)
        )

    units = cumulative_units
    final_price = _price_on_or_before(prices, end)
    final_value = units * final_price if final_price is not None else 0.0
    gains = final_value - invested
    avg_price = invested / units if units > 0 else 0.0
    performance = gains / invested if invested > 0 else 0.0

    return BacktestResult(
        periods=periods,
        invested=invested,
        units=units,
        avg_price=avg_price,
        final_value=final_value,
        gains=gains,
        performance=performance,
        series=series,
    )
