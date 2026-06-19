// Defaults & enumerations — kept in config rather than scattered in components.

import type { Frequency } from "./types";

export type ChartType = "area" | "line" | "bar";

export const MIN_DATE = "2009-01-03"; // Bitcoin genesis — global input floor (§7).

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const SIM_DEFAULTS = {
  coin: "BTC",
  amount: 100,
  frequency: "monthly" as Frequency,
  start: "2018-01-01",
} as const;

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "once", label: "Versement unique" },
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
];

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "area", label: "Aire" },
  { value: "line", label: "Ligne" },
  { value: "bar", label: "Barres" },
];
