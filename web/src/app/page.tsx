import { Button } from "@/components/ui/button";

const swatches = [
  { name: "primary", className: "bg-primary text-primary-foreground" },
  { name: "secondary", className: "bg-secondary text-secondary-foreground" },
  { name: "gain", className: "bg-gain text-white" },
  { name: "loss", className: "bg-loss text-white" },
  { name: "navy", className: "bg-navy text-white" },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          Simulateur Crypto
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-navy">
          Socle design S&apos;investir
        </h1>
        <p className="text-muted-foreground">
          Typographie Lexend, palette de marque et composants shadcn/ui — base de
          la phase 1.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {swatches.map((s) => (
          <div
            key={s.name}
            className={`${s.className} flex h-20 items-end rounded-xl p-3 text-sm font-medium`}
          >
            {s.name}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button>Bouton primaire</Button>
        <Button variant="secondary">Secondaire</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </main>
  );
}
