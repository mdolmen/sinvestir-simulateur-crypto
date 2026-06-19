import { TriangleAlert } from "lucide-react";

export function Disclaimer() {
  return (
    <div className="flex gap-3 rounded-2xl border border-secondary/50 bg-secondary/10 p-4 text-sm">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-secondary-foreground/70" />
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">Simulation rétrospective.</span>{" "}
        Ces résultats reposent sur des prix historiques réels : ils montrent ce qu&apos;un
        investissement passé aurait donné, et ne préjugent en rien des performances futures.
        Investir en crypto-actifs comporte un risque de perte en capital. Les performances
        passées ne garantissent pas les performances futures.
      </p>
    </div>
  );
}
