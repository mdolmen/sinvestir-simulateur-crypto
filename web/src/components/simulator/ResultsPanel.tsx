"use client";

import { Loader2, TriangleAlert } from "lucide-react";

import {
  formatCurrency,
  formatPercent,
  formatPrice,
  formatSignedCurrency,
  formatUnits,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SimulationResponse } from "@/lib/types";

import { KpiCard } from "./KpiCard";
import { SectionTitle } from "./fields";

interface ResultsPanelProps {
  result: SimulationResponse | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  coin: string;
}

function SubStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gain" | "loss";
}) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-xs font-light text-blue-sky">{label}</span>
      <strong
        className={cn(
          "text-sm font-bold tabular-nums",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
          tone === "default" && "text-white",
        )}
      >
        {value}
      </strong>
    </span>
  );
}

export function ResultsPanel({ result, status, error, coin }: ResultsPanelProps) {
  if (status === "error") {
    return (
      <div className="flex flex-col gap-6 lg:col-span-3">
        <SectionTitle>Vos résultats</SectionTitle>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
          <TriangleAlert className="size-8 text-loss" />
          <p className="font-normal text-white">Impossible de calculer la simulation</p>
          <p className="max-w-sm text-sm text-blue-light">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col gap-6 lg:col-span-3">
        <SectionTitle>Vos résultats</SectionTitle>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-16 text-center text-blue-light">
          <Loader2 className="size-8 animate-spin text-blue-sky" />
          <p className="text-sm">Calcul de la simulation…</p>
        </div>
      </div>
    );
  }

  const gainTone = result.gains >= 0 ? "gain" : "loss";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 transition-opacity lg:col-span-3",
        status === "loading" && "opacity-60",
      )}
    >
      <SectionTitle>Vos résultats</SectionTitle>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="col-span-2 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-normal text-white">Valeur finale</p>
          <p className="text-2xl font-normal break-words tabular-nums text-white sm:text-3xl">
            {formatCurrency(result.final_value)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <SubStat label="Somme investie" value={formatCurrency(result.invested)} />
            <SubStat
              label="Plus-value"
              value={formatSignedCurrency(result.gains)}
              tone={gainTone}
            />
          </div>
        </div>

        <KpiCard
          label="Performance"
          value={formatPercent(result.performance)}
          tone={gainTone}
        />
        <KpiCard label="Prix moyen d'acquisition" value={formatPrice(result.avg_price)} />
        <KpiCard label="Quantité acquise" value={`${formatUnits(result.units)} ${coin}`} />
        <KpiCard label="Versements" value={String(result.periods)} />
      </div>
    </div>
  );
}
