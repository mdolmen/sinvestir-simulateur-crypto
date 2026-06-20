# Simulateur Crypto — S'investir

Backtest historique « et si j'avais investi » pour la suite d'outils
**S'investir**. On choisit une crypto, un montant, une fréquence (versement
unique ou DCA) et une période passée ; le simulateur rejoue les versements sur
les **prix réels** et affiche la somme investie, la valeur finale, la
plus/moins-value, la performance et la courbe d'évolution.

Reprend la **logique fonctionnelle** de
`sinvestir.fr/simulateur-crypto-monnaie/` et l'habille aux **standards visuels**
de `simulateurs.sinvestir.fr`. Composant **autonome et embarquable**.

> Outil pédagogique. Simulation rétrospective sur données passées — ne constitue
> pas un conseil en investissement. Les performances passées ne préjugent pas
> des performances futures.

## Stack & partis pris

- **Front** — Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui +
  Recharts. Stack interne S'investir, déploiement Vercel naturel.
- **Back** — Python (FastAPI) : moteur de backtest **pur** (aucune I/O, 100 %
  testé) + couche prix derrière un contrat HTTP. Isolé → testable (`pytest`,
  `mypy --strict`), réutilisable hors-web, sources de prix interchangeables.
- **Données** — Yahoo Finance via `yfinance` (sans clé, historique quotidien
  complet, EUR natif), derrière une interface `PriceSource`.
- **Cache prix** — Supabase Postgres : *prévu, non implémenté* (voir
  `docs/ARCHITECTURE.md` §7). La couture (`PriceSource`) est en place.

Détails et décisions : `docs/ARCHITECTURE.md` · design : `docs/DESIGN.md`.

## Lancer en local

Prérequis : [uv](https://docs.astral.sh/uv/) (Python ≥ 3.11) et Node ≥ 20.

```bash
# 1. Backend (port 8000)
uv run --directory api uvicorn app.main:app --port 8000

# 2. Front (port 3000) — dans un autre terminal
cd web && npm install && npm run dev
```

Ouvrir http://localhost:3000. En dev, le front proxifie `/api/*` vers
`http://127.0.0.1:8000` (surchargeable via `API_PROXY_ORIGIN`).

## Tests & qualité

```bash
# Backend
uv run --directory api pytest          # tests (logique, golden, contrat)
uv run --directory api ruff check .
uv run --directory api mypy .

# Front
cd web && npm run lint && npm run build
```

Le moteur est vérifié par des tests déterministes sur prix synthétiques + un
**golden test** figé (`api/tests/fixtures/xrp_eur_daily.csv` → XRP, 25 €, hebdo,
2018→2026 : 442 versements, 11 050 € investis, perf ≈ +128,32 %).

## Embarquer le simulateur

Le composant est autonome ; la route `/embed` le sert nu (sans en-tête ni
footer), paramétrable par l'URL :

```html
<iframe
  src="https://VOTRE-DOMAINE/embed?coin=BTC&amount=100&frequency=monthly&start=2018-01-01"
  width="100%" height="1200" style="border:0; border-radius:24px"
  title="Simulateur crypto S'investir">
</iframe>
```

Paramètres d'URL (tous optionnels, valeurs par défaut sinon) — valables aussi
sur la page de démo `/` pour partager un scénario :

| Param | Valeurs | Défaut |
| --- | --- | --- |
| `coin` | symbole (ex. `BTC`, `ETH`, `XRP`) | `BTC` |
| `amount` | nombre ≥ 0 | `100` |
| `frequency` | `once` · `daily` · `weekly` · `monthly` | `monthly` |
| `start` | `YYYY-MM-DD` | `2018-01-01` |
| `end` | `YYYY-MM-DD` | aujourd'hui |

## Structure

```
api/        # FastAPI : engine/ (moteur pur) · prices/ (yfinance) · tests/
web/        # Next.js : app/ (/, /embed) · components/simulator/ · lib/
docs/       # ARCHITECTURE · DESIGN · TODO
vercel.json # build front (Next) + back (Python functions) sous /api
```

## Déploiement (Vercel)

`vercel.json` construit le front Next et le backend Python (`api/index.py`,
fonction ASGI) sous `/api`. Le déploiement réel reste à valider sur la première
preview (routing monorepo non vérifiable en local). En secours, on peut héberger
l'API séparément et pointer le front dessus via `NEXT_PUBLIC_API_BASE`.

## Pistes d'amélioration (hors scope démo)

- Cache prix Supabase + backfill incrémental (réduit les appels yfinance).
- Comparaison multi-cryptos / vs benchmark (ETF, livret).
