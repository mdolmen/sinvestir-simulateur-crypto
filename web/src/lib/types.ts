// Shared contract types — mirror of the backend API (docs/ARCHITECTURE.md §4).

export type Frequency = "once" | "daily" | "weekly" | "monthly";
export type Currency = "eur" | "usd";

export interface Coin {
  symbol: string;
  name: string;
}

export interface SimulationRequest {
  coin: string;
  currency: Currency;
  amount: number;
  frequency: Frequency;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

export interface SeriesPoint {
  date: string;
  invested: number;
  value: number;
}

export interface SimulationResponse {
  coin: string;
  currency: Currency;
  periods: number;
  invested: number;
  units: number;
  avg_price: number;
  final_value: number;
  gains: number;
  performance: number;
  series: SeriesPoint[];
}
