# DESIGN — Système visuel S'investir (cible + implémenté)

Objectif : reproduire l'identité du **Simulateur d'intérêts composés** de
`simulateurs.sinvestir.fr` pour que le simulateur crypto ait l'air d'appartenir à
la suite d'outils. Tokens extraits des captures dans `debug/`.

> Source de vérité visuelle : `debug/Simulateur d'Intérêts Composés -
> S'investir.html` (le widget réel) + sa feuille de styles. Ce document décrit la
> charte **et** ce qui a été implémenté côté `web/`.

> **Note importante sur la cible.** Le widget du simulateur n'est **pas** le
> thème clair Nuxt UI de la suite : c'est un **encart sombre autonome** (fond
> navy quasi-noir, texte blanc, accents bleus). C'est ce widget que l'on
> reproduit. La page d'accueil de la suite utilise par ailleurs un primary
> **vert** (Nuxt UI), hors périmètre ici.

---

## 1. Couleurs

Palette réelle du widget (classes custom de la capture), reprises comme tokens
dans `web/src/app/globals.css` :

| Token | Hex | Usage |
| --- | --- | --- |
| **blue-sky** | `#1098f7` | accent principal : bordure gauche des titres, pastilles, série « somme investie », liens/focus |
| **blue-light** | `#7899ce` | texte secondaire : labels, hints, valeurs d'axes, placeholders |
| **blue-night** | `#00173f` | texte sur fond clair (bouton blanc) |
| **violet-blue** | `#0049c6` | bleu profond : dégradé des boutons, série « capital final » |
| **gold** | `#f8d047` | série « intérêts gagnés / plus-value » |
| **fond widget** | `#0b0f1a` | surface sombre de l'encart (`--background` en mode sombre) |

Sémantique financière : **gain** `#11d05a`, **perte** `#ff5a57`.
Cartes : surfaces translucides `white/5` avec bordure `white/10`.

> Le simulateur est rendu en **mode sombre** (`<html class="dark">`) ; les tokens
> shadcn (`--background`, `--card`, `--primary`, `--border`, `--popover`…) sont
> mappés sur cette palette dans le bloc `.dark` de `globals.css`.

---

## 2. Typographie

- **Police** : **Lexend** (via `next/font/google`), fallback système.
- Hiérarchie observée :
  - **Eyebrow** : catégorie en MAJUSCULES, petit, `blue-sky`.
  - **H1** : phrase descriptive, blanc, `font-normal` (poids léger, pas bold).
  - **Titres de panneaux** : « Paramètres de simulation », « Vos résultats » —
    blanc, `text-2xl font-normal`, **bordure gauche `blue-sky`** (`border-l-2`).
  - **Labels de champ** : `blue-light`, `text-xs font-light`, + icône d'info.
- Les chiffres utilisent `tabular-nums` ; le ton général est **léger**
  (`font-light` / `font-normal`), pas gras.

---

## 3. Formes, rayons, ombres

- **Inputs** : style **souligné** (pas de boîte) — fond transparent, bordure
  basse `blue-light/30`, texte blanc `text-xl font-light`, suffixe d'unité
  (`EUR`) à droite en `blue-light`. Focus → bordure `blue-light`.
- **Cartes / KPI** : `rounded-2xl`, fond `white/5`, bordure `white/10`.
- **Boutons** : **pilules** (`rounded-full`). Primaire = dégradé
  `#0049C6 → #04265F` (hover bordure `violet-blue`) ; secondaire = fond blanc,
  texte `blue-night`, hover inversé.
- **Onglets / sélecteurs** : pilules ; état actif `bg-white/10 text-white`.

---

## 4. Layout du simulateur (implémenté)

Encart sombre autonome (`bg-[#0B0F1A]`, `rounded-3xl`), embarquable :

```
EYEBROW (blue-sky, maj.)  +  H1 (blanc)  +  intro (blue-light)   [page démo]
┌─────────────────────────────────────────────────────────────────────┐
│   encart sombre #0B0F1A                                           │
│   ┌──────────────────────┐   ┌──────────────────────────────────┐   │
│   │ Paramètres de        │   │ Vos résultats                    │   │
│   │ simulation (2/5)     │   │ (3/5)                            │   │
│   │  Crypto (recherche)  │   │  ┌───────────────┐ ┌──────────┐  │   │
│   │  Montant  (± / EUR)  │   │  │ Valeur finale │ │ Perf.    │  │   │
│   │  Fréquence           │   │  │ + sous-stats  │ └──────────┘  │   │
│   │  Depuis / Jusqu'au   │   │  ┌──────┐┌──────┐┌──────────┐    │   │
│   │  [Enregistrer]       │   │  │ Prix ││ Qté  ││Versements│    │   │
│   │  [Partager]          │   │  └──────┘└──────┘└──────────┘    │   │
│   └──────────────────────┘   └──────────────────────────────────┘   │
│   ── [Graphiques | Calendrier]          [⬚ aire ⬚ barres ⬚ donut]   │
│      ● somme investie  ● intérêts  ● capital final   (KPI/légende)  │
│      [ graphe pleine largeur  /  tableau annuel ]                   │
│   Disclaimer rétrospectif (encart blue-sky)                         │
└─────────────────────────────────────────────────────────────────────┘
```

- Grille **5 colonnes** desktop : paramètres `col-span-2`, résultats
  `col-span-3` ; empilée en mobile.
- Le **graphe est en pleine largeur** sous les deux panneaux.
- Mode **autonome / embed** : l'encart se suffit à lui-même (disclaimer inclus,
  pas de sidebar/footer requis) ; la page démo ajoute eyebrow → H1 → footer.

---

## 5. Composants

- **Champ montant** : input souligné + suffixe `EUR` ; **steppers ±1**
  (chevrons) affichés **uniquement au focus**, pas de 1.
- **Sélecteur de crypto** : combobox avec **recherche live** alimentée par le
  backend (`/api/coins`, yfinance), pas de liste en dur.
- **Cartes KPI** : libellé `blue-light`, valeur blanche ; ton sémantique
  (vert/rouge) pour la plus-value/performance. Grande carte « Valeur finale »
  avec sous-stats (somme investie / plus-value).
- **Graphe (Recharts)** — 3 séries, couleurs figées :
  - **somme investie** = `blue-sky`, **intérêts gagnés (plus-value)** = `gold`,
    **capital final** = `violet-blue` ;
  - courbes pleines + **aires dégradées** de la même couleur (transparence).
  - 3 types via boutons-icônes : **aire** · **barres** (investie+intérêts
    empilés = capital) · **donut** (investie + intérêts, capital au centre).
- **Onglets** : « Graphiques » / « Calendrier » (tableau annuel : année, somme
  investie, intérêts gagnés, capital final).
- **KPIs/légende du graphe** : pastille colorée par série + infobulle au survol.
- **Boutons d'action** : « Enregistrer la simulation » (dégradé) et « Partager
  mes résultats » (blanc) — placeholders, infobulle « Pas encore implémenté ».
- **Disclaimer** : encart `blue-sky/5`, ton sobre, non bloquant, toujours visible.

---

## 6. Mapping vers l'implémentation (Tailwind v4 + shadcn)

- Tokens de marque déclarés dans `@theme` (`globals.css`) : `--color-blue-sky`,
  `--color-blue-light`, `--color-blue-night`, `--color-violet-blue`,
  `--color-sim-bg`, + `gain` / `loss` / `gold` (via `--chart-3`).
- Le bloc `.dark` mappe les variables shadcn sur la palette navy/bleue ; le
  simulateur force ce thème (`<html class="dark">` / wrapper `.dark`).
- **Lexend** chargé via `next/font/google`.
- Couleurs de séries du graphe centralisées dans `SERIES_COLORS`
  (`components/simulator/EvolutionChart.tsx`) pour rester cohérentes avec la
  légende.

---

## 7. Écarts assumés vs. la cible

- La cible (intérêts composés) a des **intérêts toujours positifs** ; en crypto
  la **plus-value peut être négative** : l'aire « intérêts » passe sous 0, et le
  **donut** se réduit alors à une seule part « capital final ».
- La cible listait des centaines de cryptos via une recherche jQuery ; on garde
  l'idée (recherche live) mais alimentée par notre source (`/api/coins`).
- Le **bleu foncé** (capital final) reste fidèle à la cible même s'il est un peu
  discret sur le fond sombre.
