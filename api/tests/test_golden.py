"""Golden test — reference scenario against the frozen yfinance fixture.

Pins the numbers of *our* feed (see tests/fixtures/README.md); the original
simulator's figures differ only because of a different price source.
"""

from __future__ import annotations

from datetime import date
from pathlib import Path

import pytest

from engine.backtest import run_backtest
from prices.csv import load_price_csv

FIXTURE = Path(__file__).parent / "fixtures" / "xrp_eur_daily.csv"


def test_reference_scenario_matches_frozen_feed() -> None:
    prices = load_price_csv(FIXTURE)
    result = run_backtest(
        prices, amount=25.0, frequency="weekly", start=date(2018, 1, 1), end=date(2026, 6, 19)
    )
    assert result.periods == 442
    assert result.invested == pytest.approx(11050.00, abs=0.01)
    assert result.units == pytest.approx(25632.22, abs=0.01)
    assert result.avg_price == pytest.approx(0.4311, abs=0.0001)
    assert result.final_value == pytest.approx(25229.79, abs=0.01)
    assert result.performance == pytest.approx(1.2832, abs=0.0001)
