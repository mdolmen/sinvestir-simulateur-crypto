"""Deterministic tests for the contribution schedule (no prices, no network)."""

from __future__ import annotations

from datetime import date

import pytest

from engine.schedule import build_schedule


def test_once_is_a_single_payment_at_start() -> None:
    assert build_schedule(date(2020, 1, 1), date(2025, 1, 1), "once") == [date(2020, 1, 1)]


def test_single_day_range_yields_one_payment() -> None:
    day = date(2021, 6, 15)
    assert build_schedule(day, day, "daily") == [day]
    assert build_schedule(day, day, "weekly") == [day]
    assert build_schedule(day, day, "monthly") == [day]


def test_bounds_are_inclusive() -> None:
    # 2020-01-01 .. 2020-01-08 weekly hits both ends → 2 payments.
    assert build_schedule(date(2020, 1, 1), date(2020, 1, 8), "weekly") == [
        date(2020, 1, 1),
        date(2020, 1, 8),
    ]


def test_reference_scenario_has_442_weekly_periods() -> None:
    schedule = build_schedule(date(2018, 1, 1), date(2026, 6, 19), "weekly")
    assert len(schedule) == 442
    assert schedule[0] == date(2018, 1, 1)
    assert schedule[-1] == date(2026, 6, 15)  # last weekly step on or before end


def test_daily_counts_a_leap_day() -> None:
    leap = build_schedule(date(2020, 2, 28), date(2020, 3, 1), "daily")
    assert leap == [date(2020, 2, 28), date(2020, 2, 29), date(2020, 3, 1)]
    non_leap = build_schedule(date(2019, 2, 28), date(2019, 3, 1), "daily")
    assert non_leap == [date(2019, 2, 28), date(2019, 3, 1)]


def test_monthly_clamps_the_day_to_the_month_length() -> None:
    schedule = build_schedule(date(2020, 1, 31), date(2020, 4, 30), "monthly")
    assert schedule == [
        date(2020, 1, 31),
        date(2020, 2, 29),  # leap February, clamped from day 31
        date(2020, 3, 31),
        date(2020, 4, 30),
    ]


def test_end_before_start_is_rejected() -> None:
    with pytest.raises(ValueError):
        build_schedule(date(2020, 1, 2), date(2020, 1, 1), "daily")
