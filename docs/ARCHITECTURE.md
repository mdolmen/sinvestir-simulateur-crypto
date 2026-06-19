# ARCHITECTURE — Simulateur Crypto S'investir

Décisions de conception et contrat front/back. À lire avant de coder (cf.
`docs/TODO.md` phase 0). Le design est dans `docs/DESIGN.md`.

---

## 1. Contexte : trois stacks, deux rôles

On a inspecté les sources (`debug/`). Trois implémentations distinctes :

| Source | Stack réel | Rôle pour nous |
| --- | --- | --- |
| `sinvestir.fr/simulateur-crypto-monnaie` | WordPress/Elementor + calculateur **Ember.js** (iframe) | **Modèle fonctionnel** à reproduire |
| `simulateurs.sinvestir.fr` | **Nuxt/Vue + Nuxt UI** (Tailwind) | **Design cible** à imiter |
| Notre livrable | **Next.js + Python + Supabase** | reprend la logique, l'habille au design |

> On ne réutilise **aucun** des deux codebases : on reconstruit la logique (bien
> comprise et testée) et on la met aux couleurs de la suite. C'est exactement la
> mission. Next.js (et non Nuxt) parce que c'est la stack interne **déclarée**
> par S'investir ; Nuxt n'est que l'implémentation actuelle de leur suite.

---

## 2. Décisions de stack

- **Front — Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Recharts.**
  Stack interne S'investir, déploiement Vercel naturel. Recharts = graphique
  léger et suffisant (ligne/aire/barres).
- **Back — Python (FastAPI), moteur de calcul pur + couche prix.** La logique de
  backtest et l'accès aux données vivent en Python derrière un contrat HTTP.
- **Données — Yahoo Finance via `yfinance` (sans clé).** Historique **quotidien
  complet** (depuis la date de listing du coin, ~2017 pour XRP), en EUR natif,
  sans clé API — ce que CoinGecko free (365 j) et CryptoCompare (clé requise) ne
  permettent pas gratuitement. Accédé derrière une interface `PriceSource`
  (extensible à d'autres sources). API non officielle : tolérée, à isoler
  proprement. Données manipulées en **pandas**.
- **Stockage prix — Supabase Postgres.** Cache persistant des closes quotidiens
  (un close / coin / jour), alimenté par backfill incrémental (cf. §7).
- **Déploiement — Vercel.** Front Next.js + back Python en **Vercel Functions**
  (runtime Python) sous `/api`. Supabase comme base managée.

### Pourquoi un backend Python dédié (et pas des route handlers Next)

Le choix n'oppose pas « JS navigateur » à « backend », les route handlers Next
sont déjà du serveur. Le vrai arbitrage est **serveur TS (même runtime) vs
service Python séparé**. On prend Python pour les raisons suivantes :

- **Testabilité** : `pytest` + `mypy --strict` sur de la logique financière,
  rigueur que le brief valorise. (Pas pour la perf : le backtest est une somme
  sur un tableau, le calcul ne justifie pas un langage.)
- **Réutilisabilité hors-web** : le moteur sert aussi un notebook, n8n, une
  future API publique. Pas couplé au front.
- **Extensibilité des sources** : interface `PriceSource` → on branche d'autres
  fournisseurs derrière un contrat unique.
- **Prêt pour l'orchestration** : le cache-en-base implique un backfill ; à
  terme une ingestion planifiée. **Nuance Vercel** : une fonction est serverless
  *sans état* — la planification ne vit pas *dans* la fonction, c'est un **Vercel
  Cron / n8n** qui appelle un endpoint d'ingestion. Pour la démo on construit la
  **couture** (`PriceSource` + `PriceStore`) sans livrer le pipeline planifié.

À expliciter dans le README (choix polyglotte assumé).

---

## 3. Flux de données

```
Navigateur (Next.js UI)
   │  POST /api/simulate  { coin, amount, frequency, start, end, currency }
   ▼
Vercel Python Function (FastAPI)
   │  1. PriceStore (Supabase) a la plage ? → sinon PriceSource (yfinance) + upsert
   │  2. moteur de backtest pur (aucune I/O)
   ▼
   └─►  JSON { invested, units, avg_price, final_value, gains, performance, series }
```

- Le **moteur** ne fait aucune I/O : il reçoit une série de prix datés + les
  paramètres, renvoie le résultat. → 100 % testable sans réseau (cf. §6).
- `PriceSource` isole le fournisseur (yfinance : fetch + normalisation pandas).
- `PriceStore` isole le cache persistant (Supabase : lecture/upsert des closes).
- La **route** orchestre : valide les entrées, store→source si besoin, moteur.

---

## 4. Contrat d'API (à geler — phase 0)

### Requête — `POST /api/simulate`

```json
{
  "coin": "XRP",
  "currency": "eur",
  "amount": 25,
  "frequency": "weekly",
  "start": "2018-01-01",
  "end": "2026-06-19"
}
```

- `coin` : symbole, ex. `BTC`, `ETH`, `XRP`, mappé sur le ticker Yahoo
  `{COIN}-EUR`. `frequency` ∈ `once | daily | weekly | monthly`.
- `once` = versement unique de `amount` à `start`. Sinon DCA de `amount` à chaque
  échéance dans `[start, end]`.
- Dates `YYYY-MM-DD`. `currency` ∈ `eur | usd` (défaut `eur`, en config).

### Réponse

```json
{
  "coin": "ripple",
  "currency": "eur",
  "periods": 442,
  "invested": 11050.00,
  "units": 25715.23,
  "avg_price": 0.43,
  "final_value": 25705.32,
  "gains": 14655.32,
  "performance": 1.3260,
  "series": [
    { "date": "2018-01-01", "invested": 25.00, "value": 25.00 },
    { "date": "2018-01-08", "invested": 50.00, "value": 47.10 }
  ]
}
```

- `performance` en ratio (front l'affiche `×100` = `+132,60 %`).
- `series` : points pour le graphique (investi cumulé vs valeur du portefeuille).
  Granularité quotidienne, sous-échantillonnée côté API si trop dense.
- Erreurs : `400` (params invalides), `404` (coin inconnue), `502` (source prix
  indispo) — JSON `{ "error": "...", "code": "..." }`.

> Libellés front (capture Ember) : Investi · Prix moyen d'acquisition · Capital
> final · Gains / Pertes · Performance, + unités acquises (`XRP 25 715,23`).

---

## 5. Moteur de backtest — formules (vérifiées sur le scénario de référence)

Scénario : XRP, 25 €, hebdo, 2018-01-01 → 2026-06-19.

| Sortie | Formule | Réf. |
| --- | --- | --- |
| `periods` | nb d'échéances dans `[start, end]` à la fréquence | 442 |
| `invested` | `once` → `amount` ; sinon `periods × amount` | 11 050,00 € |
| `units` | `Σ amount / price[date_i]` sur chaque échéance | 25 715,23 |
| `avg_price` | `invested / units` | 0,43 € |
| `final_value` | `units × price[end]` | 25 705,32 € |
| `gains` | `final_value − invested` | 14 655,32 € |
| `performance` | `(final_value − invested) / invested` | 1,3260 (132,60 %) |

- **Échéancier** : à partir de `start`, on ajoute le pas (`+1j` / `+7j` / `+1
  mois`) tant que `≤ end`. Le nb d'échéances est **inclusif** des deux bornes
  (442 = 441 pas pleins + le versement initial).
- **Prix par échéance** : cours du jour de l'échéance (close quotidien
  Yahoo/yfinance). Si une date n'a pas de prix, on prend le dernier prix connu.
- **Valeur de la série au temps t** : `units_acquises_jusqu'à_t × price[t]`.

---

## 6. Stratégie de tests : unitaire sur tous les calculs

Exigence : **tests unitaires pour tous les calculs**. Le moteur étant pur, c'est
direct.

1. **Tests de logique (déterministes, sans réseau)** — prix synthétiques :
   - échéancier : nb d'échéances pour chaque fréquence sur des bornes connues
     (dont le 442 du scénario de référence) ; bornes inclusives ; mois à 28/30/31
     jours ; années bissextiles.
   - `units` / `avg_price` : prix constant `p` → `units = invested/p`,
     `avg_price = p` ; prix variables → somme à la main.
   - `final_value`, `gains`, `performance` : cas calculés à la main.
   - `once` vs DCA ; montant 0 ; période d'un seul jour ; perte (performance < 0).
2. **Test « golden » (scénario de référence)** — fixture de prix XRP réels
   **figée dans le repo** (`api/tests/fixtures/xrp_eur_daily.csv`, snapshot
   yfinance ; input = série de prix, output = les chiffres figés), pour reproduire
   le scénario avec tolérance (arrondis). Aucune dépendance réseau en CI. **Le
   golden test épingle les chiffres de *notre* feed** (perf ≈ 128,32 %), pas ceux
   du simulateur d'origine (132,60 %) ; l'écart vient de la source de prix, pas du
   calcul — détail dans `api/tests/fixtures/README.md`.
3. **Tests `PriceSource` / `PriceStore`** — parsing/normalisation yfinance +
   logique de cache/backfill, avec réponses mockées.
4. **Test de contrat** — la route renvoie le schéma attendu (validation Pydantic).

`pytest` ; `mypy --strict` + `ruff` verts (cf. CLAUDE.md).

---

## 7. Données & cache (yfinance + Supabase)

**Source** — Yahoo Finance via `yfinance`, ticker `{COIN}-EUR`,
`Ticker(...).history(start, end, interval="1d")` → DataFrame pandas (close
quotidien). Pas de clé, historique complet depuis le listing. API non officielle
→ isolée derrière `PriceSource`, gérer rate-limit/erreurs proprement.

**Stockage** — table Supabase `prices(coin, currency, date, close)`, unique sur
`(coin, currency, date)`. On stocke **un close / jour** (pas d'intraday).

**Cache & backfill incrémental** (logique voulue) :
1. À la requête, lire en base la plage `(coin, currency, [start, end])`.
2. **Couverte** → servir depuis la base, zéro appel externe.
3. **Manquante / partielle** → fetch yfinance depuis `min(start, plus ancienne
   dispo)` ou, en mise à jour, depuis `dernière_date_en_base − 1 j`
   (chevauchement d'1 j pour ne rien perdre), jusqu'à aujourd'hui ; upsert.
4. **Plancher** = plus ancienne date réellement dispo pour le coin (≈ sa date de
   listing ; pas avant). 2009-01-03 (genesis BTC) reste la borne basse de
   validation d'input. **Plafond** = aujourd'hui.

**Ingestion planifiée** (hors démo, archi prête) : un **Vercel Cron / n8n**
appelle un endpoint qui rejoue l'étape 3 pour les coins suivis → la base se tient
à jour sans appel à la lecture.

---

## 8. Autonomie & embed

- Le simulateur est un **composant React autonome** (`<CryptoSimulator />`),
  piloté par props + URL params, sans dépendance à l'app-shell (ni sidebar ni
  footer requis).
- **Page démo** : `/` — habille le composant (eyebrow, H1, disclaimer, footer).
- **Route embed** : `/embed` — le seul composant, nu, paramétrable par query
  (`?coin=bitcoin&amount=25&frequency=monthly&start=...`), pensée pour `<iframe>`.
- README fournira le snippet `<iframe>` copiable. Peu de dépendances = critère.

---

## 9. Arborescence cible (proposée)

```
/
├─ web/                  # Next.js (App Router)
│  ├─ app/
│  │  ├─ page.tsx        # démo
│  │  └─ embed/page.tsx  # version embarquable
│  ├─ components/simulator/   # <CryptoSimulator/> + sous-composants
│  └─ lib/               # client API, formatage devise/%, types partagés
├─ api/                  # Python (Vercel Functions)
│  ├─ simulate.py        # route FastAPI → /api/simulate
│  ├─ engine/            # moteur de backtest PUR (testé)
│  ├─ prices/            # PriceSource (yfinance) + PriceStore (Supabase)
│  └─ tests/             # pytest (unit + golden)
├─ docs/                 # DESIGN, ARCHITECTURE, TODO
└─ vercel.json           # routing front + functions Python
```

> Types : le contrat (§4) est dupliqué en TS (`web/lib/types`) et Pydantic
> (`api`). Source de vérité = ce document ; on garde les deux alignés à la main
> (petit contrat, acceptable). Génération auto = amélioration future.

---

## 10. Décisions tranchées / ouvertes

Tranché :
- ✅ **Source** : Yahoo Finance via `yfinance` (sans clé, historique complet ;
  CryptoCompare écarté car clé désormais requise).
- ✅ **API live** : oui (pas de fixtures pré-bundlées en prod ; fixtures = tests).
- ✅ **Devise** : EUR seul pour la démo.
- ✅ **Cache** : Supabase Postgres, backfill incrémental (§7).
- ✅ **Dates hors-couverture** : borner aux dates réellement disponibles pour le
  coin (date de listing → aujourd'hui), message clair si la plage déborde.

Ouvert (à régler en codant, non bloquant) :
- [ ] **Granularité de `series`** renvoyée (quotidienne brute vs sous-échantillon
      hebdo/mensuel) selon la longueur de période, pour un payload raisonnable.
