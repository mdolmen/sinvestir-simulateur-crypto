"""Deterministic backtest tests on synthetic prices (exact by construction)."""

from __future__ import annotations

from datetime import date

import pandas as pd
import pytest

from engine.backtest import run_backtest


def _daily_series(prices: dict[str, float]) -> pd.Series[float]:
    """Build a sorted daily-indexed close series from {date_str: price}."""
    index = pd.to_datetime(list(prices.keys()))
    return pd.Series(list(prices.values()), index=index, dtype="float64").sort_index()


def test_constant_price_recovers_invested_with_no_gains() -> None:
    prices = _daily_series({f"2020-01-0{d}": 10.0 for d in range(1, 9)})
    result = run_backtest(
        prices, amount=100.0, frequency="weekly", start=date(2020, 1, 1), end=date(2020, 1, 8)
    )
    assert result.periods == 2
    assert result.invested == 200.0
    assert result.units == pytest.approx(20.0)  # 100/10 + 100/10
    assert result.avg_price == pytest.approx(10.0)
    assert result.final_value == pytest.approx(200.0)
    assert result.gains == pytest.approx(0.0)
    assert result.performance == pytest.approx(0.0)


def test_variable_price_matches_hand_computation() -> None:
    # 100€ on 01-01 at 10€, 100€ on 01-08 at 20€.
    prices = _daily_series({"2020-01-01": 10.0, "2020-01-08": 20.0})
    result = run_backtest(
        prices, amount=100.0, frequency="weekly", start=date(2020, 1, 1), end=date(2020, 1, 8)
    )
    assert result.units == pytest.approx(15.0)  # 10 + 5
    assert result.avg_price == pytest.approx(200.0 / 15.0)
    assert result.final_value == pytest.approx(300.0)  # 15 units * 20
    assert result.gains == pytest.approx(100.0)
    assert result.performance == pytest.approx(0.5)


def test_forward_fill_uses_last_known_price() -> None:
    # No quote on 01-08; the last known close (01-05 = 25€) is used.
    prices = _daily_series({"2020-01-01": 10.0, "2020-01-05": 25.0})
    result = run_backtest(
        prices, amount=50.0, frequency="weekly", start=date(2020, 1, 1), end=date(2020, 1, 8)
    )
    assert result.units == pytest.approx(50.0 / 10.0 + 50.0 / 25.0)
    assert result.final_value == pytest.approx((50.0 / 10.0 + 50.0 / 25.0) * 25.0)


def test_once_invests_a_single_amount() -> None:
    prices = _daily_series({"2020-01-01": 10.0, "2020-12-31": 40.0})
    result = run_backtest(
        prices, amount=100.0, frequency="once", start=date(2020, 1, 1), end=date(2020, 12, 31)
    )
    assert result.periods == 1
    assert result.invested == 100.0
    assert result.units == pytest.approx(10.0)
    assert result.final_value == pytest.approx(400.0)  # 10 units * 40
    assert result.performance == pytest.approx(3.0)


def test_loss_yields_negative_performance() -> None:
    prices = _daily_series({"2020-01-01": 100.0, "2020-12-31": 50.0})
    result = run_backtest(
        prices, amount=100.0, frequency="once", start=date(2020, 1, 1), end=date(2020, 12, 31)
    )
    assert result.final_value == pytest.approx(50.0)
    assert result.gains == pytest.approx(-50.0)
    assert result.performance == pytest.approx(-0.5)


def test_zero_amount_is_well_defined() -> None:
    prices = _daily_series({"2020-01-01": 10.0, "2020-01-08": 20.0})
    result = run_backtest(
        prices, amount=0.0, frequency="weekly", start=date(2020, 1, 1), end=date(2020, 1, 8)
    )
    assert result.invested == 0.0
    assert result.units == 0.0
    assert result.avg_price == 0.0
    assert result.final_value == 0.0
    assert result.gains == 0.0
    assert result.performance == 0.0


def test_series_tracks_cumulative_invested_and_value() -> None:
    prices = _daily_series({"2020-01-01": 10.0, "2020-01-08": 20.0})
    result = run_backtest(
        prices, amount=100.0, frequency="weekly", start=date(2020, 1, 1), end=date(2020, 1, 8)
    )
    assert [p.date for p in result.series] == [date(2020, 1, 1), date(2020, 1, 8)]
    assert result.series[0].invested == 100.0
    assert result.series[0].value == pytest.approx(100.0)  # 10 units * 10
    assert result.series[1].invested == 200.0
    assert result.series[1].value == pytest.approx(300.0)  # 15 units * 20


def test_payments_before_first_price_are_padded_with_zero() -> None:
    # Prices only from 2022; monthly payments scheduled from 2021 buy nothing
    # until data exists, instead of failing.
    prices = _daily_series({"2022-01-01": 10.0, "2022-12-01": 20.0})
    result = run_backtest(
        prices, amount=100.0, frequency="monthly", start=date(2021, 1, 1), end=date(2022, 12, 1)
    )
    # Only the 12 payments from 2022-01 onward are realized.
    assert result.periods == 12
    assert result.invested == 1200.0
    # The 2021 points are flat zero (invested and value), so gains there are zero.
    assert result.series[0].date == date(2021, 1, 1)
    assert result.series[0].invested == 0.0
    assert result.series[0].value == 0.0
    assert result.series[11].invested == 0.0  # last 2021 month, still nothing
    assert result.series[12].invested == 100.0  # first 2022 payment


def test_once_before_first_price_invests_nothing() -> None:
    prices = _daily_series({"2020-01-05": 10.0})
    result = run_backtest(
        prices, amount=10.0, frequency="once", start=date(2020, 1, 1), end=date(2020, 1, 5)
    )
    assert result.periods == 0
    assert result.invested == 0.0
    assert result.units == 0.0
    assert result.final_value == 0.0
    assert result.performance == 0.0
