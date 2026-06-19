"""GET /api/coins — searches the price source for coins (data-driven picker)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import DEFAULT_CURRENCY, Currency
from app.deps import get_price_source
from prices.base import PriceSource

router = APIRouter()


class CoinOut(BaseModel):
    symbol: str
    name: str


class CoinsResponse(BaseModel):
    coins: list[CoinOut]


@router.get("/api/coins")
def coins(
    source: Annotated[PriceSource, Depends(get_price_source)],
    q: str = "",
    currency: Currency = DEFAULT_CURRENCY,
) -> CoinsResponse:
    try:
        matches = source.search_coins(q, currency)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail={"error": str(exc), "code": "price_source_unavailable"},
        ) from exc
    return CoinsResponse(coins=[CoinOut(symbol=m.symbol, name=m.name) for m in matches])
