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


def _price_at(prices: pd.Series[float], when: date) -> float:
    """Last known close on or before `when` (forward-fill, per §5)."""
    price = float(cast(float, prices.asof(pd.Timestamp(when))))
    if math.isnan(price):
        raise ValueError(f"no price available on or before {when.isoformat()}")
    return price


def run_backtest(
    prices: pd.Series[float],
    *,
    amount: float,
    frequency: Frequency,
    start: date,
    end: date,
) -> BacktestResult:
    """Run a once/DCA backtest and compute the §4 contract outputs."""
    if amount < 0:
        raise ValueError("amount must be non-negative")

    schedule = build_schedule(start, end, frequency)
    periods = len(schedule)
    invested = periods * amount

    cumulative_units = 0.0
    series: list[SeriesPoint] = []
    for index, when in enumerate(schedule):
        price = _price_at(prices, when)
        cumulative_units += amount / price
        series.append(
            SeriesPoint(
                date=when,
                invested=(index + 1) * amount,
                value=cumulative_units * price,
            )
        )

    units = cumulative_units
    final_value = units * _price_at(prices, end)
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
