"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { ChartType } from "@/lib/config";
import type { SeriesPoint } from "@/lib/types";

interface EvolutionChartProps {
  series: SeriesPoint[];
  type: ChartType;
}

// Series colors mirror the reference: light blue (invested), gold (gains),
// dark blue (final value).
export const SERIES_COLORS = {
  invested: "#1098f7",
  gains: "#f8d047",
  value: "#0049c6",
} as const;

const LABELS: Record<string, string> = {
  value: "Capital final",
  invested: "Somme investie",
  gains: "Intérêts gagnés",
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: { dataKey?: string | number; color?: string; value?: number }[];
  label?: string | number;
}

function yearTick(date: string): string {
  return date.slice(0, 4);
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          className="flex items-center justify-between gap-4 tabular-nums"
        >
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: entry.color }} />
            {LABELS[String(entry.dataKey)]}
          </span>
          <span className="font-medium">{formatCurrency(entry.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

export function EvolutionChart({ series, type }: EvolutionChartProps) {
  // Enrich with gains (= value − invested) so all three series are available.
  const data = series.map((p) => ({ ...p, gains: p.value - p.invested }));

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
      <XAxis
        dataKey="date"
        tickFormatter={yearTick}
        minTickGap={40}
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
      />
      <YAxis
        tickFormatter={formatCompactCurrency}
        width={64}
        tickLine={false}
        axisLine={false}
        tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
      />
      <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
    </>
  );

  if (type === "bar") {
    // Stacked: invested (bottom) + gains (top) sum to the final value.
    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data}>
          {axes}
          <Bar
            dataKey="invested"
            stackId="capital"
            fill={SERIES_COLORS.invested}
            fillOpacity={0.85}
          />
          <Bar
            dataKey="gains"
            stackId="capital"
            fill={SERIES_COLORS.gains}
            fillOpacity={0.85}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data}>
          {axes}
          <Line dataKey="value" stroke={SERIES_COLORS.value} dot={false} strokeWidth={2.5} />
          <Line dataKey="invested" stroke={SERIES_COLORS.invested} dot={false} strokeWidth={2} />
          <Line dataKey="gains" stroke={SERIES_COLORS.gains} dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <AreaChart data={data}>
        <defs>
          {Object.entries(SERIES_COLORS).map(([key, color]) => (
            <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.04} />
            </linearGradient>
          ))}
        </defs>
        {axes}
        <Area
          dataKey="value"
          stroke={SERIES_COLORS.value}
          fill="url(#fill-value)"
          strokeWidth={2.5}
        />
        <Area
          dataKey="invested"
          stroke={SERIES_COLORS.invested}
          fill="url(#fill-invested)"
          strokeWidth={2}
        />
        <Area
          dataKey="gains"
          stroke={SERIES_COLORS.gains}
          fill="url(#fill-gains)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
