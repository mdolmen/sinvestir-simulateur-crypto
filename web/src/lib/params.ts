// Parse simulator defaults from URL query params (shared by the demo and embed
// pages). Invalid/missing values fall back to the configured defaults.

import { SIM_DEFAULTS, todayISO } from "./config";
import type { Frequency } from "./types";

export interface SimDefaults {
  defaultCoin: string;
  defaultAmount: number;
  defaultFrequency: Frequency;
  defaultStart: string;
  defaultEnd: string;
}

const FREQUENCIES: Frequency[] = ["once", "daily", "weekly", "monthly"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseSimParams(searchParams: SearchParams): SimDefaults {
  const coin = first(searchParams.coin)?.trim().toUpperCase() || SIM_DEFAULTS.coin;

  const amountRaw = Number(first(searchParams.amount));
  const amount =
    Number.isFinite(amountRaw) && amountRaw >= 0 ? amountRaw : SIM_DEFAULTS.amount;

  const freq = first(searchParams.frequency) as Frequency | undefined;
  const frequency = freq && FREQUENCIES.includes(freq) ? freq : SIM_DEFAULTS.frequency;

  const startRaw = first(searchParams.start);
  const start = startRaw && DATE_RE.test(startRaw) ? startRaw : SIM_DEFAULTS.start;

  const endRaw = first(searchParams.end);
  const end = endRaw && DATE_RE.test(endRaw) ? endRaw : todayISO();

  return {
    defaultCoin: coin,
    defaultAmount: amount,
    defaultFrequency: frequency,
    defaultStart: start,
    defaultEnd: end,
  };
}
