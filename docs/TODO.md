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

- [ ] Initialiser le repo Next.js + Tailwind + shadcn/ui. **Verif** : `dev`
      tourne, page blanche stylée.
- [ ] Importer les **tokens de design** S'investir (couleurs, typo Lexend,
      rayons, ombres) depuis `docs/DESIGN.md` dans la config Tailwind/CSS.
      **Verif** : une page de démo affiche la palette et la typo correctes.
- [ ] Mettre en place le backend Python (FastAPI) + lancement local. **Verif** :
      `/health` répond 200.
- [ ] Câbler le déploiement Vercel (front + functions). **Verif** : preview URL
      en ligne avec le `/health` accessible.

## Phase 2 — Logique de calcul (backend, contract-driven)

- [ ] Implémenter la récupération de prix historiques (par crypto + plage de
      dates) avec cache. **Verif** : test sur BTC 2020→2024, valeurs plausibles.
- [ ] Implémenter le moteur de backtest : versement unique + DCA (quotidien /
      hebdo / mensuel). **Verif** : tests unitaires sur cas connus (somme
      investie, nb de versements, valeur finale).
- [ ] Calculer les sorties : somme investie, valeur finale, plus/moins-value
      (montant + %), série temporelle de la valeur du portefeuille. **Verif** :
      test d'un scénario de bout en bout contre des nombres calculés à la main.
- [ ] Exposer le endpoint de simulation conforme au contrat figé en phase 0.
      **Verif** : appel HTTP réel renvoie le JSON attendu.

## Phase 3 — Interface du simulateur (front)

- [ ] **Layout** fidèle : eyebrow catégorie + H1, panneau gauche « Paramètres »,
      panneau droit « Vos résultats ». **Verif** : comparaison visuelle au
      simulateur d'intérêts composés capturé.
- [ ] **Champs de saisie** : sélecteur de crypto (recherche), montant, fréquence,
      dates début/fin, avec textes d'aide façon S'investir. **Verif** : chaque
      champ pilote bien l'état et déclenche le recalcul.
- [ ] **Cartes résultats (KPI)** : Somme investie / Plus-value / Valeur finale.
      **Verif** : valeurs synchronisées avec le backend.
- [ ] **Graphique** d'évolution (Recharts) + sélecteur de type de graphique.
      **Verif** : la courbe correspond à la série renvoyée par l'API.
- [ ] **Disclaimer** rétrospectif + risque (obligatoire pour la crypto).
      **Verif** : visible et non bloquant.
- [ ] États **chargement / erreur / vide**. **Verif** : couper le réseau →
      message propre, pas de crash.

## Phase 4 — Responsive & intégrabilité

- [ ] Passes responsive desktop + mobile (empilement des panneaux). **Verif** :
      rendu propre à 375px et 1440px.
- [ ] **Mode embed** : route/`<iframe>` autonome, sans nav ni footer, params via
      URL, peu de dépendances. **Verif** : page de démo qui embed le simulateur.
- [ ] Documenter l'usage embed (snippet copiable). **Verif** : un dev colle le
      snippet et ça marche.

## Phase 5 — Finitions & livraison

- [ ] `README.md` minimal : lancer le projet, partis pris, choix de stack
      justifié, suggestions d'amélioration. **Verif** : un nouveau venu lance le
      projet en suivant le README seul.
- [ ] Accessibilité de base (labels, contraste, focus clavier). **Verif** :
      navigation clavier complète du formulaire.
- [ ] Déploiement Vercel final + lien démo cliquable. **Verif** : URL publique
      fonctionnelle de bout en bout.
- [ ] (Bonus) Script/Loom de présentation (5 min max).

---

## Suggestions d'amélioration (à mentionner dans le README, hors scope démo)

- Comparaison multi-cryptos / vs benchmark (ETF, livret).
- Sauvegarde de simulation (Supabase) façon « Mes simulations ».
- Préréglages (« 10€/mois de BTC depuis 2017 »).
- Partage d'un scénario par URL + image OG générée.
