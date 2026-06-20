import { Info } from "lucide-react";

// Hover tooltip styled like the reference (blue-sky tinted bubble, asymmetric radii).
export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group/tip relative inline-flex">
      <Info className="size-3.5 text-blue-light/60" aria-label={text} />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-max max-w-[16rem] -translate-x-1/2 rounded-tr-2xl rounded-bl-2xl border border-blue-sky/10 bg-blue-sky/10 px-3 py-2 text-xs font-light whitespace-normal text-white backdrop-blur group-hover/tip:block">
        {text}
      </span>
    </span>
  );
}

// Underline input styling matching the S'investir simulator (transparent field,
// white value text, blue bottom border). `[color-scheme:dark]` darkens the
// native date picker.
export const underlineInputClass =
  "w-full border-0 border-b border-blue-light/30 bg-transparent px-0 pb-2 text-xl font-light text-white transition-colors placeholder:text-blue-light/40 focus:border-blue-light focus:outline-none [color-scheme:dark]";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-l-2 border-blue-sky px-4 text-xl font-normal text-white sm:text-2xl">
      {children}
    </h3>
  );
}

export function SimField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-xs font-light text-blue-light"
      >
        {label}
        {hint && <InfoTooltip text={hint} />}
      </label>
      {children}
    </div>
  );
}
