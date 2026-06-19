"""Contract tests for POST /api/simulate (price source overridden, no network)."""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.deps import get_price_source
from app.main import app
from prices.csv import CsvPriceSource

FIXTURE = Path(__file__).parent / "fixtures" / "xrp_eur_daily.csv"


@pytest.fixture
def client() -> Iterator[TestClient]:
    app.dependency_overrides[get_price_source] = lambda: CsvPriceSource(FIXTURE)
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_simulate_returns_the_contract_schema(client: TestClient) -> None:
    response = client.post(
        "/api/simulate",
        json={
            "coin": "XRP",
            "currency": "eur",
            "amount": 25,
            "frequency": "weekly",
            "start": "2018-01-01",
            "end": "2026-06-19",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {
        "coin",
        "currency",
        "periods",
        "invested",
        "units",
        "avg_price",
        "final_value",
        "gains",
        "performance",
        "series",
    }
    assert body["coin"] == "XRP"
    assert body["currency"] == "eur"
    assert body["periods"] == 442
    assert body["invested"] == 11050.00
    assert body["units"] == pytest.approx(25632.22, abs=0.01)
    assert body["performance"] == pytest.approx(1.2832, abs=0.0001)
    assert len(body["series"]) == 442
    assert set(body["series"][0]) == {"date", "invested", "value"}
    assert body["series"][0]["date"] == "2018-01-01"


def test_simulate_rejects_end_before_start(client: TestClient) -> None:
    response = client.post(
        "/api/simulate",
        json={
            "coin": "XRP",
            "amount": 25,
            "frequency": "weekly",
            "start": "2020-01-01",
            "end": "2019-01-01",
        },
    )
    assert response.status_code == 422


def test_simulate_returns_404_for_unknown_coin(monkeypatch: pytest.MonkeyPatch) -> None:
    import pandas as pd

    class EmptySource:
        def fetch(self, coin: str, currency: str, start: object, end: object) -> pd.Series[float]:
            return pd.Series(dtype="float64", name="close")

    app.dependency_overrides[get_price_source] = lambda: EmptySource()
    try:
        response = TestClient(app).post(
            "/api/simulate",
            json={
                "coin": "NOPE",
                "amount": 25,
                "frequency": "weekly",
                "start": "2020-01-01",
                "end": "2021-01-01",
            },
        )
        assert response.status_code == 404
        assert response.json()["detail"]["code"] == "coin_not_found"
    finally:
        app.dependency_overrides.clear()
