"use client";

import { useEffect, useState } from "react";

import { ApiError, simulate } from "@/lib/api";
import { SIM_DEFAULTS, todayISO } from "@/lib/config";
import type { Frequency, SimulationRequest, SimulationResponse } from "@/lib/types";

import { ChartPanel } from "./ChartPanel";
import { Disclaimer } from "./Disclaimer";
import { ParametersPanel } from "./ParametersPanel";
import { ResultsPanel } from "./ResultsPanel";

export interface CryptoSimulatorProps {
  defaultCoin?: string;
  defaultAmount?: number;
  defaultFrequency?: Frequency;
  defaultStart?: string;
  defaultEnd?: string;
}

export function CryptoSimulator(props: CryptoSimulatorProps) {
  const [params, setParams] = useState<SimulationRequest>(() => ({
    coin: props.defaultCoin ?? SIM_DEFAULTS.coin,
    currency: "eur",
    amount: props.defaultAmount ?? SIM_DEFAULTS.amount,
    frequency: props.defaultFrequency ?? SIM_DEFAULTS.frequency,
    start: props.defaultStart ?? SIM_DEFAULTS.start,
    end: props.defaultEnd ?? todayISO(),
  }));
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const handle = setTimeout(() => {
      if (!(params.amount >= 0) || !params.coin || params.end < params.start) {
        setStatus("error");
        setError("Vérifiez le montant, la crypto et l'ordre des dates.");
        return;
      }
      setStatus("loading");
      setError(null);
      simulate(params, controller.signal)
        .then((data) => {
          setResult(data);
          setStatus("idle");
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          setError(
            err instanceof ApiError ? err.message : "Impossible de récupérer les données.",
          );
          setStatus("error");
        });
    }, 400);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [params]);

  return (
    <div className="dark flex flex-col gap-10 rounded-3xl bg-sim-bg p-6 text-foreground sm:p-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        <ParametersPanel params={params} onChange={setParams} />
        <ResultsPanel result={result} status={status} error={error} coin={params.coin} />
      </div>
      <ChartPanel result={result} status={status} />
      <Disclaimer />
    </div>
  );
}
