"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHART_TYPES, type ChartType } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { SimulationResponse } from "@/lib/types";

import { EvolutionChart } from "./EvolutionChart";
import { SectionTitle } from "./fields";

interface ChartPanelProps {
  result: SimulationResponse | null;
  status: "idle" | "loading" | "error";
}

const CHART_ITEMS: Record<string, string> = Object.fromEntries(
  CHART_TYPES.map((t) => [t.value, t.label]),
);

export function ChartPanel({ result, status }: ChartPanelProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle>Évolution</SectionTitle>
        <Select
          items={CHART_ITEMS}
          value={chartType}
          onValueChange={(value) => setChartType(value as ChartType)}
        >
          <SelectTrigger size="sm" aria-label="Type de graphique" className="text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHART_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 p-5 transition-opacity",
          status === "loading" && "opacity-60",
        )}
      >
        {result ? (
          <EvolutionChart series={result.series} type={chartType} />
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-blue-light">
            {status === "error" ? "Graphique indisponible." : "Calcul de la simulation…"}
          </div>
        )}
      </div>
    </div>
  );
}
