# DESIGN — Système visuel S'investir (cible)

Objectif : reproduire l'identité de `simulateurs.sinvestir.fr` pour que le
simulateur crypto ait l'air d'appartenir à la suite d'outils. Tokens extraits des
captures dans `debug/` (CSS Nuxt UI / Tailwind v4).

> Source : pages capturées du **Simulateur d'intérêts composés** et du
> **dashboard des simulateurs**. Le simulateur crypto réel partage cette charte.

---

## 1. Couleurs

### Marque

| Rôle | Hex | Usage |
| --- | --- | --- |
| **Primary** (bleu) | `#1098f7` | couleur dominante : accents, liens, boutons, courbes, état actif |
| **Secondary** (jaune/or) | `#f8d047` | accent secondaire : CTA « Formation », surlignages, badges |
| Violet-blue | `#0049c6` | bleu profond pour aplats/hover |
| Navy | `#00173f` · `#071a35` · `#0a0f1a` | fonds sombres (header/footer/sidebar) |
| Bleu muté | `#7899ce` | éléments secondaires sur fond sombre |

### Sémantique (résultats financiers)

| Rôle | Hex | Usage |
| --- | --- | --- |
| **Gain / positif** | `#11d05a` | plus-value, courbe haussière |
| **Perte / négatif** | `#ff0500` (alt `#fb2c36`) | moins-value, alertes |

### Neutres

- Fond page : `#ffffff` ; surfaces sombres : navy ci-dessus.
- Texte principal : quasi-noir `#0f172a` / `#000000`.
- Texte secondaire / dimmed : gris `#6b7280`, bordures `#d1d5db` / `#e8e8e8`.
- Échelle neutre type Tailwind `neutral-50 → 900` (Nuxt UI `--ui-color-neutral-*`).

> Mode sombre présent dans la charte (tokens `--ui-bg`, `--ui-text-*` ont une
> variante sombre). **Hors scope démo** sauf si le temps le permet : viser le
> mode clair d'abord.

---

## 2. Typographie

- **Police** : **Lexend** (Google Fonts), avec fallback système.
  ```
  Lexend, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", sans-serif
  ```
- Mono (rare) : stack `ui-monospace, SFMono-Regular, Menlo, Monaco, …`.
- Hiérarchie observée :
  - **Eyebrow** : libellé de catégorie en MAJUSCULES, petit, couleur primary
    (ex. `SIMULATEUR INTÉRÊTS COMPOSÉS`).
  - **H1** : titre phrase descriptive, gros, gras (ex. « Calculez combien un
    investissement peut vous rapporter au fil du temps »).
  - **Titres de panneaux** : « Paramètres de simulation », « Vos résultats ».
  - **Labels de champ** : taille normale, gras léger, avec texte d'aide gris
    dessous.

---

## 3. Formes, rayons, ombres

- `--ui-radius: .25rem` (base Nuxt UI). Échelle dérivée :
  - boutons / inputs : ~`.375rem` (`rounded-md`).
  - **cartes / panneaux** : `1rem`–`1.25rem` (`rounded-2xl`), c'est le look
    signature des cartes.
  - **pills / badges** : full (`9999px`).
- Ombres douces et diffuses sur les cartes (élévation légère), pas de bord dur.
- Bordures fines `1px` gris clair sur surfaces blanches.

---

## 4. Layout du simulateur (gabarit à reproduire)

Structure observée sur le simulateur d'intérêts composés :

```
┌───────────────────────────────────────────────────────────┐
│  (App: sidebar nav à gauche — hors scope démo autonome)    │
├───────────────────────────────────────────────────────────┤
│  EYEBROW CATÉGORIE (primary, majuscules)                   │
│  H1 — phrase descriptive                                   │
│                                                            │
│  ┌──────────────────────┐   ┌───────────────────────────┐ │
│  │ Paramètres de        │   │ Vos résultats             │ │
│  │ simulation           │   │                           │ │
│  │                      │   │  ┌────┐ ┌────┐ ┌────┐      │ │
│  │  [champ + aide]      │   │  │KPI │ │KPI │ │KPI │      │ │
│  │  [champ + aide]      │   │  └────┘ └────┘ └────┘      │ │
│  │  [champ + aide]      │   │                           │ │
│  │  …                   │   │  [ Graphique d'évolution ] │ │
│  │                      │   │  [ Type de graphique ▾ ]   │ │
│  └──────────────────────┘   └───────────────────────────┘ │
│                                                            │
│  ┌───────────────────────────────────────────────────────┐│
│  │  CTA — Accédez à notre Formation Offerte (secondary)   ││
│  └───────────────────────────────────────────────────────┘│
│  Footer : Mentions légales · Confidentialité · Notice …    │
└───────────────────────────────────────────────────────────┘
```

- **2 colonnes** desktop : gauche = paramètres, droite = résultats.
  Mobile : empilées (paramètres puis résultats).
- Carte CTA pleine largeur sous les deux panneaux (accent jaune).
- En mode **autonome / embed** : on retire la sidebar et le footer applicatifs,
  on garde eyebrow → H1 → 2 panneaux → disclaimer.

---

## 5. Composants

- **Inputs** : champ numérique avec unité (€, %, ans) + icône d'aide / texte
  d'aide gris sous le label. Probables sliders couplés aux nombres (à confirmer
  sur la capture crypto) — pour la démo, champ numérique + slider optionnel.
- **Cartes KPI** : libellé en gris + valeur en gros gras ; couleur sémantique
  pour la plus/moins-value (vert/rouge).
- **Graphique** : courbe (ligne) par défaut, sélecteur de type (ligne / barres /
  camembert vu dans les assets `LineChart` / `BarChart` / `PieChart`). Couleur de
  série = primary `#1098f7`, surface investie vs gains différenciées.
- **Boutons** : primaire plein bleu, CTA formation plein jaune ; coins arrondis,
  poids gras.
- **Disclaimer crypto** : encart d'avertissement (rétrospectif + volatilité),
  ton sobre, non bloquant.

---

## 6. Mapping vers l'implémentation (Tailwind + shadcn)

Tokens à déclarer dans la config (thème) — valeurs S'investir par défaut :

```css
--color-primary:   #1098f7;  /* brand bleu          */
--color-secondary: #f8d047;  /* brand jaune/or      */
--color-gain:      #11d05a;  /* positif             */
--color-loss:      #ff0500;  /* négatif             */
--color-navy:      #00173f;  /* surfaces sombres    */
--radius:          1rem;     /* cartes (rounded-2xl)*/
/* font: Lexend via next/font ou @fontsource */
```

- Mapper sur les variables de thème shadcn (`--primary`, `--secondary`,
  `--radius`, …) pour que les composants héritent de la charte.
- Charger **Lexend** via `next/font/google`.
- Garder la nomenclature sémantique (`gain`/`loss`) pour ne pas coder en dur des
  couleurs dans les composants de résultat.

---

## 7. À confirmer sur la capture du simulateur crypto

Le crypto réel n'est pas dans `debug/` (seulement intérêts composés + dashboard).
À vérifier avant la phase UI :

- présence de sliders vs champs numériques purs ;
- intitulés exacts des champs (crypto, montant, fréquence, dates) ;
- format d'affichage des KPI et du graphique (devise, %, période) ;
- texte exact du disclaimer.
