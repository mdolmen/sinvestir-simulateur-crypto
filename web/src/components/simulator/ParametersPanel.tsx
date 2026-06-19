"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ParametersPanelProps {
  params: SimulationRequest;
  onChange: (params: SimulationRequest) => void;
}

const FREQUENCY_ITEMS: Record<string, string> = Object.fromEntries(
  FREQUENCY_OPTIONS.map((o) => [o.value, o.label]),
);

function FieldRow({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="font-medium">
        {label}
      </Label>
      {children}
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ParametersPanel({ params, onChange }: ParametersPanelProps) {
  const update = (patch: Partial<SimulationRequest>) => onChange({ ...params, ...patch });
  const today = todayISO();

  return (
    <Card className="h-fit rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Paramètres de simulation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FieldRow label="Crypto-monnaie" htmlFor="coin" hint="La crypto à backtester.">
          <CoinCombobox id="coin" value={params.coin} onChange={(coin) => update({ coin })} />
        </FieldRow>

        <FieldRow
          label="Montant"
          htmlFor="amount"
          hint="Somme investie à chaque échéance (ou en une fois)."
        >
          <div className="relative">
            <Input
              id="amount"
              type="number"
              min={0}
              step={5}
              value={Number.isNaN(params.amount) ? "" : params.amount}
              onChange={(e) => update({ amount: e.target.valueAsNumber })}
              className="pr-8"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
              €
            </span>
          </div>
        </FieldRow>

        <FieldRow
          label="Fréquence"
          htmlFor="frequency"
          hint="Versement unique ou investissement programmé (DCA)."
        >
          <Select
            items={FREQUENCY_ITEMS}
            value={params.frequency}
            onValueChange={(value) => update({ frequency: value as Frequency })}
          >
            <SelectTrigger id="frequency" className="w-full">
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
        </FieldRow>

        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Depuis" htmlFor="start" hint="Début de la période.">
            <Input
              id="start"
              type="date"
              min={MIN_DATE}
              max={params.end}
              value={params.start}
              onChange={(e) => update({ start: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="Jusqu'au" htmlFor="end" hint="Fin de la période.">
            <Input
              id="end"
              type="date"
              min={params.start}
              max={today}
              value={params.end}
              onChange={(e) => update({ end: e.target.value })}
            />
          </FieldRow>
        </div>
      </CardContent>
    </Card>
  );
}
