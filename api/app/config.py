"""Runtime configuration & defaults — kept out of scattered literals."""

from __future__ import annotations

from datetime import date
from typing import Literal

Currency = Literal["eur", "usd"]

DEFAULT_CURRENCY: Currency = "eur"

# Bitcoin genesis block — global floor for input date validation (§7).
MIN_DATE = date(2009, 1, 3)
