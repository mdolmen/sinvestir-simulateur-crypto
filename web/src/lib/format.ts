// fr-FR display formatting for the results (currency, percent, units).

const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return EUR.format(value);
}

export function formatSignedCurrency(value: number): string {
  return `${value > 0 ? "+" : ""}${EUR.format(value)}`;
}

// Crypto prices can be well below 1 € — keep more decimals for small values.
export function formatPrice(value: number): string {
  const digits = value !== 0 && Math.abs(value) < 1 ? 4 : 2;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatUnits(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(ratio: number): string {
  const pct = ratio * 100;
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pct);
  return `${pct > 0 ? "+" : ""}${formatted} %`;
}

// Compact currency for chart axes (e.g. "10 k€").
export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
