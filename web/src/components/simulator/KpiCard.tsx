import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "gain" | "loss";
  className?: string;
}

export function KpiCard({ label, value, hint, tone = "default", className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-5",
        className,
      )}
    >
      <span className="text-xs font-light text-blue-light">{label}</span>
      <span
        className={cn(
          "text-2xl font-normal tabular-nums",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
          tone === "default" && "text-white",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs font-light text-blue-light tabular-nums">{hint}</span>}
    </div>
  );
}
