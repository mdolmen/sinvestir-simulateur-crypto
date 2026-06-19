"use client";

import { useState } from "react";
import { Loader2, LineChart as LineChartIcon, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHART_TYPES, type ChartType } from "@/lib/config";
import {
  formatCurrency,
  formatPercent,
  formatPrice,
  formatSignedCurrency,
  formatUnits,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SimulationResponse } from "@/lib/types";

import { EvolutionChart } from "./EvolutionChart";
import { KpiCard } from "./KpiCard";

interface ResultsPanelProps {
  result: SimulationResponse | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  coin: string;
}

const CHART_ITEMS: Record<string, string> = Object.fromEntries(
  CHART_TYPES.map((t) => [t.value, t.label]),
);

export function ResultsPanel({ result, status, error, coin }: ResultsPanelProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  if (status === "error") {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <TriangleAlert className="size-8 text-loss" />
          <p className="font-medium">Impossible de calculer la simulation</p>
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Calcul de la simulation…</p>
        </CardContent>
      </Card>
    );
  }

  const gainTone = result.gains >= 0 ? "gain" : "loss";

  return (
    <Card className={cn("rounded-2xl transition-opacity", status === "loading" && "opacity-60")}>
      <CardHeader>
        <CardTitle className="text-lg">Vos résultats</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard label="Somme investie" value={formatCurrency(result.invested)} />
          <KpiCard
            label="Plus-value"
            value={formatSignedCurrency(result.gains)}
            hint={formatPercent(result.performance)}
            tone={gainTone}
            emphasis
          />
          <KpiCard label="Valeur finale" value={formatCurrency(result.final_value)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard label="Prix moyen d'acquisition" value={formatPrice(result.avg_price)} />
          <KpiCard label="Quantité acquise" value={`${formatUnits(result.units)} ${coin}`} />
          <KpiCard label="Versements" value={String(result.periods)} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <LineChartIcon className="size-4" />
              Évolution
            </h3>
            <Select
              items={CHART_ITEMS}
              value={chartType}
              onValueChange={(value) => setChartType(value as ChartType)}
            >
              <SelectTrigger size="sm" aria-label="Type de graphique">
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
          <EvolutionChart series={result.series} type={chartType} />
        </div>
      </CardContent>
    </Card>
  );
}
