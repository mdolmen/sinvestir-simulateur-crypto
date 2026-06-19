// Typed client for POST /api/simulate. Same-origin by default; set
// NEXT_PUBLIC_API_BASE to target another origin.

import type { Coin, SimulationRequest, SimulationResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export class ApiError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

interface ErrorBody {
  detail?: { error?: string; code?: string } | string;
}

export async function simulate(
  request: SimulationRequest,
  signal?: AbortSignal,
): Promise<SimulationResponse> {
  const response = await fetch(`${API_BASE}/api/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    let body: ErrorBody | undefined;
    try {
      body = (await response.json()) as ErrorBody;
    } catch {
      // non-JSON error response
    }
    const detail = body?.detail;
    if (detail && typeof detail === "object") {
      throw new ApiError(detail.error ?? `Erreur ${response.status}`, detail.code ?? String(response.status));
    }
    throw new ApiError(`Erreur ${response.status}`, String(response.status));
  }

  return (await response.json()) as SimulationResponse;
}

export async function searchCoins(query: string, signal?: AbortSignal): Promise<Coin[]> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`${API_BASE}/api/coins?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new ApiError(`Erreur ${response.status}`, String(response.status));
  }
  const data = (await response.json()) as { coins: Coin[] };
  return data.coins;
}
