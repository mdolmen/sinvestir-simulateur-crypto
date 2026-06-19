"""Contribution schedule: the dates at which a payment occurs.

Both bounds of [start, end] are inclusive (see docs/ARCHITECTURE.md §5).
"""

from __future__ import annotations

import calendar
from datetime import date, timedelta
from typing import Literal

Frequency = Literal["once", "daily", "weekly", "monthly"]


def _add_months(anchor: date, months: int) -> date:
    """`anchor` shifted by `months`, clamping the day to the target month length."""
    total = anchor.month - 1 + months
    year = anchor.year + total // 12
    month = total % 12 + 1
    day = min(anchor.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def build_schedule(start: date, end: date, frequency: Frequency) -> list[date]:
    """Payment dates in [start, end], both inclusive, for the given frequency.

    `once` yields a single payment at `start`; the recurring frequencies step
    from `start` (+1 day / +7 days / +1 calendar month) while the date stays
    on or before `end`.
    """
    if end < start:
        raise ValueError("end must be on or after start")
    if frequency == "once":
        return [start]

    dates: list[date] = []
    current = start
    if frequency == "daily":
        while current <= end:
            dates.append(current)
            current += timedelta(days=1)
    elif frequency == "weekly":
        while current <= end:
            dates.append(current)
            current += timedelta(days=7)
    else:  # monthly
        step = 0
        while current <= end:
            dates.append(current)
            step += 1
            current = _add_months(start, step)
    return dates
