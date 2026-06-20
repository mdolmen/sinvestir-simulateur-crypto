"use client";

import { useState } from "react";
import {
  AreaChart as AreaIcon,
  BarChart3 as BarIcon,
  CalendarDays,
  PieChart as PieIcon,
} from "lucide-react";

import { CHART_TYPES, type ChartType } from "@/lib/config";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SimulationResponse } from "@/lib/types";

import { EvolutionChart, SERIES_COLORS } from "./EvolutionChart";
import { InfoTooltip } from "./fields";

interface ChartPanelProps {
  result: SimulationResponse | null;
  status: "idle" | "loading" | "error";
}

const TYPE_ICONS: Record<ChartType, typeof AreaIcon> = {
  area: AreaIcon,
  bar: BarIcon,
  pie: PieIcon,
};

function ChartKpis({ result }: { result: SimulationResponse }) {
  const items = [
    {
      label: "Somme investie",
      value: formatCurrency(result.invested),
      color: SERIES_COLORS.invested,
      tip: "Total des sommes que vous avez investies (de votre poche).",
    },
    {
      label: "Intérêts gagnés",
      value: formatSignedCurrency(result.gains),
      color: SERIES_COLORS.gains,
      tip: "Plus-value générée par votre investissement (capital final − somme investie).",
    },
    {
      label: "Capital final",
      value: formatCurrency(result.final_value),
      color: SERIES_COLORS.value,
      tip: "Valeur totale finale de votre placement.",
    },
  ];
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1 text-center sm:text-left">
          <p className="flex items-center justify-center gap-2 text-sm font-light text-blue-light sm:justify-start">
            <span className="size-2.5 rounded-full" style={{ background: item.color }} />
            {item.label}
            <InfoTooltip text={item.tip} />
          </p>
          <p className="text-xl font-normal tabular-nums text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function yearlyRows(result: SimulationResponse) {
  const byYear = new Map<string, { invested: number; value: number }>();
  for (const point of result.series) {
    byYear.set(point.date.slice(0, 4), { invested: point.invested, value: point.value });
  }
  return [...byYear.entries()].map(([year, p]) => ({
    year,
    invested: p.invested,
    gains: p.value - p.invested,
    value: p.value,
  }));
}

function CalendarView({ result }: { result: SimulationResponse }) {
  const rows = yearlyRows(result);
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-light text-blue-light">
            <th className="px-4 py-3 text-left">Année</th>
            <th className="px-4 py-3 text-right">Somme investie</th>
            <th className="px-4 py-3 text-right">Intérêts gagnés</th>
            <th className="px-4 py-3 text-right">Capital final</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year} className="border-t border-white/10">
              <td className="px-4 py-2.5 font-normal text-white">{row.year}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-white/80">
                {formatCurrency(row.invested)}
              </td>
              <td
                className={cn(
                  "px-4 py-2.5 text-right tabular-nums",
                  row.gains >= 0 ? "text-gain" : "text-loss",
                )}
              >
                {formatSignedCurrency(row.gains)}
              </td>
              <td className="px-4 py-2.5 text-right font-medium tabular-nums text-white">
                {formatCurrency(row.value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartPanel({ result, status }: ChartPanelProps) {
  const [tab, setTab] = useState<"graph" | "calendar">("graph");
  const [chartType, setChartType] = useState<ChartType>("area");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          <TabButton active={tab === "graph"} onClick={() => setTab("graph")} icon={AreaIcon}>
            Graphiques
          </TabButton>
          <TabButton
            active={tab === "calendar"}
            onClick={() => setTab("calendar")}
            icon={CalendarDays}
          >
            Calendrier
          </TabButton>
        </div>

        {tab === "graph" && (
          <div className="flex items-center gap-2">
            <span className="pr-1 text-sm font-light text-blue-light">Type de graphique</span>
            {CHART_TYPES.map((t) => {
              const Icon = TYPE_ICONS[t.value];
              return (
                <button
                  key={t.value}
                  type="button"
                  aria-label={t.label}
                  aria-pressed={chartType === t.value}
                  onClick={() => setChartType(t.value)}
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    chartType === t.value
                      ? "bg-white/10 text-white"
                      : "text-blue-light hover:text-white",
                  )}
                >
                  <Icon className="size-5" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!result ? (
        <div className="flex h-[340px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-blue-light">
          {status === "error" ? "Graphique indisponible." : "Calcul de la simulation…"}
        </div>
      ) : tab === "graph" ? (
        <div
          className={cn(
            "flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 transition-opacity",
            status === "loading" && "opacity-60",
          )}
        >
          <ChartKpis result={result} />
          <EvolutionChart series={result.series} type={chartType} />
        </div>
      ) : (
        <div className={cn("transition-opacity", status === "loading" && "opacity-60")}>
          <CalendarView result={result} />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof AreaIcon;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-light transition-colors",
        active ? "bg-white/10 text-white" : "text-blue-light hover:bg-white/[0.03]",
      )}
    >
      <Icon className="size-5" />
      {children}
    </button>
  );
}
