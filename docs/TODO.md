# TODO — Simulateur Crypto S'investir

## Contexte

- **Mission** : reprendre la **logique fonctionnelle** du simulateur crypto de
  `sinvestir.fr/simulateur-crypto-monnaie/` et l'habiller aux **standards
  visuels** de `simulateurs.sinvestir.fr`.
- **Nature du simulateur** : backtest historique « et si j'avais investi ». On
  choisit une crypto, un montant, une fréquence (versement unique / quotidien /
  hebdo / mensuel) et une période passée ; on affiche la somme investie, la
  valeur finale, la plus/moins-value et la courbe d'évolution.
- **Livrable** : démo en ligne (Vercel), responsive, composant autonome &
  **embarquable**, code propre + README.

## Partis pris techniques (tranchés — voir `ARCHITECTURE.md`)

- **Front** : Next.js (App Router) + Tailwind + shadcn/ui + Recharts.
- **Back** : Python (FastAPI) — moteur de backtest pur + couche prix, derrière un
  contrat HTTP. Déployé en Vercel Python Functions.
- **Données** : **Yahoo Finance via `yfinance`** (sans clé, historique quotidien
  complet, pandas), derrière une interface `PriceSource`. CoinGecko écarté (free
  plafonné à 365 j), CryptoCompare écarté (clé désormais requise).
- **Stockage** : **Supabase Postgres** — cache des closes quotidiens, backfill
  incrémental.
- **Justification stack** (pour le README) : Next.js + Vercel = stack interne ;
  moteur Python isolé derrière une frontière HTTP → testable, réutilisable,
  extensible. Détails dans `ARCHITECTURE.md`.

---

## Phase 0 — Cadrage & architecture (à faire avant de coder)

- [x] Rédiger `docs/ARCHITECTURE.md` : frontière front/back, contrat d'API,
      source de données, stratégie de cache, modèle d'embed.
- [x] Geler le contrat d'API (entrées/sorties JSON du endpoint de simulation) —
      cf. `ARCHITECTURE.md` §4.
- [x] **Valider la source par un appel réel** : yfinance `XRP-EUR` sur
      2018→2026 ✅ — série complète, `periods`/`investi`/`prix moyen` identiques à
      la référence, perf 128,32 % (vs 132,60 % d'origine : écart de *source de
      prix*, pas de calcul). Fixture figée dans `api/tests/fixtures/` + note du
      golden test. La logique du moteur est validée.

## Phase 1 — Socle projet

- [x] Initialiser le repo Next.js + Tailwind v4 + shadcn/ui (`web/`). **Verif** :
      `build` passe.
- [x] Importer les **tokens de design** S'investir (couleurs, typo Lexend,
      rayons) dans `web/src/app/globals.css`. **Verif** : page de vérif affiche la
      palette et la typo.
- [x] Mettre en place le backend Python (FastAPI, uv) + `/api/health`. **Verif** :
      pytest vert (ruff + mypy --strict OK).
- [~] Câbler le déploiement Vercel (`vercel.json` + entrypoint ASGI +
      `requirements.txt`). **Reste** : `vercel deploy` réel → valider la preview
      URL et `/api/health` en ligne (non vérifiable en local).

## Phase 2 — Logique de calcul (backend, contract-driven)

- [~] Implémenter la récupération de prix historiques (par crypto + plage de
      dates) avec cache. **Fait** : `PriceSource` (yfinance) + loader CSV, tests
      mockés. **Reste** : cache Supabase (`PriceStore`) + backfill, repoussé (§7).
- [x] Implémenter le moteur de backtest : versement unique + DCA (quotidien /
      hebdo / mensuel). Moteur pur dans `api/engine/`, tests déterministes sur
      prix synthétiques (échéancier, bornes inclusives, bissextiles, once vs DCA).
- [x] Calculer les sorties : somme investie, valeur finale, plus/moins-value
      (montant + %), série temporelle. Golden test figé sur `xrp_eur_daily.csv`
      (442 / 11 050 € / perf +128,32 %).
- [x] Exposer le endpoint de simulation conforme au contrat figé en phase 0
      (`POST /api/simulate`, validation Pydantic). Test de contrat hors-ligne via
      la source CSV. **Reste** : appel HTTP réel en preview Vercel.

## Phase 3 — Interface du simulateur (front)

- [x] **Layout** fidèle : eyebrow + H1, panneau gauche « Paramètres de
      simulation », panneau droit « Vos résultats », CTA formation + footer.
- [x] **Champs de saisie** : sélecteur de crypto **avec recherche live**
      (`/api/coins`, alimenté par yfinance — pas de liste en dur), montant,
      fréquence, dates, avec textes d'aide. Recalcul live débouncé à chaque champ.
- [x] **Cartes résultats (KPI)** : somme investie / plus-value (+ performance) /
      valeur finale, + prix moyen, quantité acquise, versements. Sync backend.
- [x] **Graphique** d'évolution (Recharts) + sélecteur de type (aire/ligne/barres)
      sur la série renvoyée par l'API.
- [x] **Disclaimer** rétrospectif + risque, intégré au composant (visible en embed).
- [x] États **chargement / erreur**. **Verif** : build + appel live OK (BTC
      mensuel 2018→2026 → +292 %). **Reste** : passe responsive/a11y → phase 4.

## Phase 4 — Responsive & intégrabilité

- [x] Passes responsive desktop + mobile (empilement des panneaux). **Verif** :
      rendu propre à 375px (émulation mobile, aucun overflow) et 1440px.
- [x] **Mode embed** : route `/embed` autonome, sans nav ni footer, params via
      URL (`coin/amount/frequency/start/end`), parsés aussi sur `/`.
- [x] Documenter l'usage embed (snippet `<iframe>` copiable dans le README).

## Phase 5 — Finitions & livraison

- [x] `README.md` : lancer le projet, partis pris, choix de stack justifié,
      embed, tests, suggestions d'amélioration.
- [x] Accessibilité de base : labels (`htmlFor`/`aria-label`), focus clavier
      (`focus-visible` sur onglets/icônes/boutons), contraste AA (texte
      blue-light/blanc sur navy). **Verif** : navigation clavier du formulaire.
- [~] Déploiement Vercel final + lien démo cliquable. **Reste** : `vercel deploy`
      (compte requis, non faisable en local) — config prête, voir README.
- [ ] (Bonus) Script/Loom de présentation (5 min max) — fait par l'auteur.

---

## Suggestions d'amélioration (à mentionner dans le README, hors scope démo)

- Comparaison multi-cryptos / vs benchmark (ETF, livret).
- Partage d'un scénario par URL + image OG générée.

- Simulateur TCA (Transaction Cost Analysis)
- Un ou deux simulateurs accessiblse sans création de compte (prêt immo et auto). Parlent à tous le monde. Moins de friction. Je comprends la logique business de capter des leads. Peut amener des gens à se creer un compte et s'interesser à l'investissement.
