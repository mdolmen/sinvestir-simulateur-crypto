import { Info } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-blue-sky/10 bg-blue-sky/5 p-4 text-sm backdrop-blur">
      <Info className="mt-0.5 size-5 shrink-0 text-blue-sky" />
      <p className="font-light text-white/80">
        <span className="font-normal text-white">Simulation rétrospective.</span>{" "}
        Ces résultats reposent sur des prix historiques réels : ils montrent ce qu&apos;un
        investissement passé aurait donné, et ne préjugent en rien des performances futures.
        Investir en crypto-actifs comporte un risque de perte en capital. Les performances
        passées ne garantissent pas les performances futures.
      </p>
    </div>
  );
}
