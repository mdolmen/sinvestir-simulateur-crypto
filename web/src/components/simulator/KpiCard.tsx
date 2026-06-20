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
          "text-xl font-normal break-words tabular-nums sm:text-2xl",
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
