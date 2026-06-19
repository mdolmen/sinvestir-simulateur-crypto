import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "gain" | "loss";
  emphasis?: boolean;
}

export function KpiCard({ label, value, hint, tone = "default", emphasis }: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-2xl border bg-card p-4",
        emphasis && "ring-1 ring-primary/20",
      )}
    >
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={cn(
          "text-2xl font-bold tabular-nums",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-sm font-medium text-muted-foreground tabular-nums">{hint}</span>}
    </div>
  );
}
