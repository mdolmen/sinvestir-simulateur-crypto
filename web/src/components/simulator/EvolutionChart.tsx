"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

const COLORS = {
  value: "var(--primary)",
  invested: "var(--muted-foreground)",
};

const LABELS = { value: "Valeur du portefeuille", invested: "Investi cumulé" };

interface TooltipEntry {
  dataKey?: string | number;
  color?: string;
  value?: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
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
        <p key={entry.dataKey} className="flex items-center justify-between gap-4 tabular-nums">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: entry.color }} />
            {LABELS[entry.dataKey as keyof typeof LABELS]}
          </span>
          <span className="font-medium">{formatCurrency(entry.value ?? 0)}</span>
        </p>
      ))}
    </div>
  );
}

export function EvolutionChart({ series, type }: EvolutionChartProps) {
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
      <Tooltip content={<ChartTooltip />} />
      <Legend
        formatter={(v) => LABELS[v as keyof typeof LABELS] ?? v}
        wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
      />
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={320}>
      {type === "bar" ? (
        <BarChart data={series}>
          {axes}
          <Bar dataKey="invested" fill={COLORS.invested} radius={[2, 2, 0, 0]} />
          <Bar dataKey="value" fill={COLORS.value} radius={[2, 2, 0, 0]} />
        </BarChart>
      ) : type === "line" ? (
        <LineChart data={series}>
          {axes}
          <Line dataKey="invested" stroke={COLORS.invested} dot={false} strokeWidth={2} />
          <Line dataKey="value" stroke={COLORS.value} dot={false} strokeWidth={2} />
        </LineChart>
      ) : (
        <AreaChart data={series}>
          <defs>
            <linearGradient id="fill-value" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.value} stopOpacity={0.3} />
              <stop offset="100%" stopColor={COLORS.value} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {axes}
          <Area
            dataKey="invested"
            stroke={COLORS.invested}
            fill="none"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <Area
            dataKey="value"
            stroke={COLORS.value}
            fill="url(#fill-value)"
            strokeWidth={2}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}
