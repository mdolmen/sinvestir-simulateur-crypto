"""POST /api/simulate — validates input, fetches prices, runs the pure engine (§4)."""

from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, model_validator

from app.config import DEFAULT_CURRENCY, MIN_DATE, Currency
from app.deps import get_price_source
from engine.backtest import run_backtest
from engine.schedule import Frequency
from prices.base import PriceSource

router = APIRouter()


class SimulationRequest(BaseModel):
    coin: str
    currency: Currency = DEFAULT_CURRENCY
    amount: float = Field(ge=0)
    frequency: Frequency
    start: date
    end: date

    @model_validator(mode="after")
    def _check_dates(self) -> SimulationRequest:
        if self.start < MIN_DATE:
            raise ValueError(f"start must be on or after {MIN_DATE.isoformat()}")
        if self.end < self.start:
            raise ValueError("end must be on or after start")
        return self


class SeriesPointOut(BaseModel):
    date: date
    invested: float
    value: float


class SimulationResponse(BaseModel):
    coin: str
    currency: str
    periods: int
    invested: float
    units: float
    avg_price: float
    final_value: float
    gains: float
    performance: float
    series: list[SeriesPointOut]


@router.post("/api/simulate")
def simulate(
    request: SimulationRequest,
    source: Annotated[PriceSource, Depends(get_price_source)],
) -> SimulationResponse:
    try:
        prices = source.fetch(request.coin, request.currency, request.start, request.end)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail={"error": str(exc), "code": "price_source_unavailable"},
        ) from exc

    if prices.empty:
        raise HTTPException(
            status_code=404,
            detail={"error": f"unknown coin {request.coin!r}", "code": "coin_not_found"},
        )

    result = run_backtest(
        prices,
        amount=request.amount,
        frequency=request.frequency,
        start=request.start,
        end=request.end,
    )
    return SimulationResponse(
        coin=request.coin,
        currency=request.currency,
        periods=result.periods,
        invested=round(result.invested, 2),
        units=round(result.units, 2),
        avg_price=round(result.avg_price, 4),
        final_value=round(result.final_value, 2),
        gains=round(result.gains, 2),
        performance=round(result.performance, 4),
        series=[
            SeriesPointOut(
                date=point.date,
                invested=round(point.invested, 2),
                value=round(point.value, 2),
            )
            for point in result.series
        ],
    )
