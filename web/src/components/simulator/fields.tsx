import { Info } from "lucide-react";

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
        {hint && (
          <span title={hint}>
            <Info className="size-3.5 text-blue-light/60" aria-label={hint} />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
