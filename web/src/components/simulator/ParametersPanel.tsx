"use client";

import { ChevronDown, ChevronUp, Save, Share2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FREQUENCY_OPTIONS, MIN_DATE, todayISO } from "@/lib/config";
import type { Frequency, SimulationRequest } from "@/lib/types";

import { CoinCombobox } from "./CoinCombobox";
import { ComingSoonButton } from "./ComingSoonButton";
import { SectionTitle, SimField, underlineInputClass } from "./fields";

interface ParametersPanelProps {
  params: SimulationRequest;
  onChange: (params: SimulationRequest) => void;
}

const FREQUENCY_ITEMS: Record<string, string> = Object.fromEntries(
  FREQUENCY_OPTIONS.map((o) => [o.value, o.label]),
);

const safeAmount = (value: number): number => (Number.isNaN(value) ? 0 : value);

const selectTriggerClass =
  "w-full justify-between rounded-none border-0 border-b border-blue-light/30 bg-transparent px-0 py-2 text-base font-light text-white hover:bg-transparent data-[placeholder]:text-blue-light focus-visible:ring-0";

export function ParametersPanel({ params, onChange }: ParametersPanelProps) {
  const update = (patch: Partial<SimulationRequest>) => onChange({ ...params, ...patch });
  const today = todayISO();

  return (
    <div className="flex flex-col gap-6 lg:col-span-2">
      <SectionTitle>Paramètres de simulation</SectionTitle>

      <div className="space-y-6 sm:space-y-8">
        <SimField label="Crypto-monnaie" htmlFor="coin" hint="La crypto à backtester.">
          <CoinCombobox id="coin" value={params.coin} onChange={(coin) => update({ coin })} />
        </SimField>

        <SimField
          label="Montant"
          htmlFor="amount"
          hint="Somme investie à chaque échéance (ou en une fois)."
        >
          <div className="group relative">
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              value={Number.isNaN(params.amount) ? "" : params.amount}
              onChange={(e) => update({ amount: Number(e.target.value.replace(",", ".")) })}
              className={`${underlineInputClass} pr-20`}
            />
            <div className="pointer-events-none absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-2">
              <div className="flex flex-col text-blue-light opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Augmenter le montant"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => update({ amount: safeAmount(params.amount) + 1 })}
                  className="transition-colors hover:text-white"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Diminuer le montant"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => update({ amount: Math.max(0, safeAmount(params.amount) - 1) })}
                  className="transition-colors hover:text-white"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
              <span className="text-sm font-light text-blue-light">EUR</span>
            </div>
          </div>
        </SimField>

        <SimField
          label="Fréquence"
          htmlFor="frequency"
          hint="Versement unique ou investissement programmé (DCA)."
        >
          <Select
            items={FREQUENCY_ITEMS}
            value={params.frequency}
            onValueChange={(value) => update({ frequency: value as Frequency })}
          >
            <SelectTrigger id="frequency" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SimField>

        <div className="grid grid-cols-2 gap-4">
          <SimField label="Depuis" htmlFor="start">
            <input
              id="start"
              type="date"
              min={MIN_DATE}
              max={params.end}
              value={params.start}
              onChange={(e) => update({ start: e.target.value })}
              className={`${underlineInputClass} text-base`}
            />
          </SimField>
          <SimField label="Jusqu'au" htmlFor="end">
            <input
              id="end"
              type="date"
              min={params.start}
              max={today}
              value={params.end}
              onChange={(e) => update({ end: e.target.value })}
              className={`${underlineInputClass} text-base`}
            />
          </SimField>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <ComingSoonButton variant="primary">
          <Save className="size-4" />
          Enregistrer la simulation
        </ComingSoonButton>
        <ComingSoonButton variant="white">
          <Share2 className="size-4" />
          Partager mes résultats
        </ComingSoonButton>
      </div>
    </div>
  );
}
