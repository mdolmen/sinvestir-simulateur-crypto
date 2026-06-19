import { CryptoSimulator } from "@/components/simulator/CryptoSimulator";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:py-16">
      <header className="flex flex-col gap-3">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase">
          Simulateur Crypto-monnaie
        </span>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance text-navy sm:text-4xl">
          Calculez ce qu&apos;un investissement crypto passé vous aurait rapporté
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Choisissez une crypto, un montant et une fréquence (versement unique ou DCA), puis une
          période historique. Le simulateur rejoue vos versements sur les prix réels et affiche la
          plus-value, la performance et la courbe d&apos;évolution.
        </p>
      </header>

      <CryptoSimulator />

      <footer className="border-t pt-6 text-sm text-muted-foreground">
        <p>
          Démo construite aux standards visuels de S&apos;investir. Prix historiques via Yahoo
          Finance. Outil pédagogique — ne constitue pas un conseil en investissement.
        </p>
      </footer>
    </main>
  );
}
