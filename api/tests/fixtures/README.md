# Fixtures de test

Données de prix **figées** pour rendre les tests du moteur déterministes (zéro
appel réseau en CI).

## `xrp_eur_daily.csv`

- **Contenu** : close quotidien XRP en EUR, colonnes `date,close`.
- **Source** : yfinance (Yahoo Finance), symbole `XRP-EUR`, snapshot.
- **Plage** : 2017-12-20 → 2026-06-19 (3104 points). La marge avant 2018-01-01
  couvre le forward-fill.
- **Manipulation** : chargé via pandas (`pd.read_csv(..., index_col="date",
  parse_dates=True)`), reindex quotidien + `ffill` pour les prix par échéance.

## Golden test — scénario de référence

Paramètres : **XRP, 25 €, hebdomadaire, 2018-01-01 → 2026-06-19**.

Sorties attendues **recalculées depuis cette fixture** (= ce que le golden test
asserte, à l'arrondi près) :

| Sortie | Valeur (yfinance) |
| --- | --- |
| `periods` | **442** |
| `invested` | **11 050,00 €** |
| `units` | **25 632,22 XRP** |
| `avg_price` | **0,4311 €** |
| `final_price` | **0,9843 €** (2026-06-19) |
| `final_value` | **25 229,79 €** |
| `performance` | **+128,32 %** |

## ⚠️ Détail important — dépendance à la source de prix

Le simulateur d'origine donnait pour ce **même** scénario : `units ≈ 25 715,23`,
`capital final ≈ 25 705 €`, **performance ≈ +132,60 %**.

L'écart (~3 % sur la performance) **n'est pas une erreur de calcul** : il vient
uniquement d'un **flux de prix différent** (le simulateur d'origine utilisait une
autre source que Yahoo). Preuve que la logique est exacte : `periods`, `invested`
et `avg_price` tombent **identiques** à la référence ; seuls les chiffres
dépendant du prix absolu (unités, valeur finale, performance) divergent, et la
performance est très sensible au prix de fin (0,98 € vs ~1,00 €).

Conséquence sur les tests :
- le **golden test épingle les chiffres de *notre* feed** (yfinance, tableau
  ci-dessus), pas ceux du simulateur d'origine ;
- les chiffres de référence servent de **garde-fou de plausibilité** (même ordre
  de grandeur), pas de cible au centième ;
- les **tests de logique** (échéancier, DCA, moyennes) restent sur prix
  synthétiques et sont, eux, exacts par construction.

> Régénération : `uv run --with yfinance --with pandas python <script>` (le
> script de génération vit hors repo ; la fixture committée est la source de
> vérité). Re-snapshotter peut faire bouger les décimales (données Yahoo
> révisées) → mettre à jour le tableau attendu en conséquence.
