"""Tests for coin search: yfinance parsing (mocked) and the /api/coins route."""

from __future__ import annotations

from datetime import date

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.deps import get_price_source
from app.main import app
from prices.base import CoinMatch
from prices.yahoo import YahooPriceSource


def test_yahoo_search_dedupes_by_base_symbol_and_cleans_name(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    frame = pd.DataFrame(
        {"shortName": ["Bitcoin USD", "Bitcoin EUR", "Bitcoin Cash USD"]},
        index=["BTC-USD", "BTC-EUR", "BCH-USD"],
    )

    class FakeLookup:
        def __init__(self, query: str) -> None:
            self.query = query

        def get_cryptocurrency(self, count: int) -> pd.DataFrame:
            return frame

    monkeypatch.setattr("prices.yahoo.yf.Lookup", FakeLookup)

    matches = YahooPriceSource().search_coins("bitcoin", "eur")
    assert matches == [CoinMatch("BTC", "Bitcoin"), CoinMatch("BCH", "Bitcoin Cash")]


def test_yahoo_search_blank_query_falls_back_to_default(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    frame = pd.DataFrame(
        {"shortName": ["Bitcoin USD", "Ethereum USD"]},
        index=["BTC-USD", "ETH-USD"],
    )
    captured: dict[str, str] = {}

    class FakeLookup:
        def __init__(self, query: str) -> None:
            captured["query"] = query

        def get_cryptocurrency(self, count: int) -> pd.DataFrame:
            return frame

    monkeypatch.setattr("prices.yahoo.yf.Lookup", FakeLookup)

    matches = YahooPriceSource().search_coins("   ", "eur")
    assert captured["query"] == "USD"  # default broad lookup
    assert matches == [CoinMatch("BTC", "Bitcoin"), CoinMatch("ETH", "Ethereum")]


def test_coins_route_returns_matches() -> None:
    class FakeSource:
        def fetch(self, coin: str, currency: str, start: date, end: date) -> pd.Series[float]:
            return pd.Series(dtype="float64")

        def search_coins(self, query: str, currency: str) -> list[CoinMatch]:
            return [CoinMatch("ETH", "Ethereum"), CoinMatch("XRP", "XRP")]

    app.dependency_overrides[get_price_source] = lambda: FakeSource()
    try:
        response = TestClient(app).get("/api/coins", params={"q": "e"})
        assert response.status_code == 200
        assert response.json() == {
            "coins": [
                {"symbol": "ETH", "name": "Ethereum"},
                {"symbol": "XRP", "name": "XRP"},
            ]
        }
    finally:
        app.dependency_overrides.clear()
