# CLAUDE.md

Crypto investment simulator for the **S'investir** tools suite. We reproduce the
**functional logic** of `sinvestir.fr/simulateur-crypto-monnaie/` (a historical
"what if I had invested" backtester) and dress it in the **visual standards** of
`simulateurs.sinvestir.fr`. Deliverable: a live, manipulable demo on Vercel,
responsive, as a standalone & **embeddable** component.

Read `docs/DESIGN.md` for the target design system, `docs/TODO.md` for the
sequenced build plan, and `docs/ARCHITECTURE.md` (once written) before changing
code.

Stack (proposed, validated in phase 0): **Next.js + Tailwind + shadcn/ui** front,
**Python (FastAPI)** back for the backtest + price proxy, **Vercel** deploy,
historical prices from **CoinGecko**.

These are behavioral guidelines (derived from Karpathy's notes on LLM coding
pitfalls), specialized to this repo. They bias toward caution over speed; use
judgment on trivial tasks.

## 1. Think before coding

- State assumptions explicitly. If a requirement is ambiguous, ask — don't pick
  silently.
- If multiple interpretations exist, surface them. If a simpler approach exists,
  say so and push back when warranted.
- If something is unclear, stop and name what's confusing.

## 2. Simplicity first

- Minimum code that solves the problem. Nothing speculative.
- No features, abstractions, "flexibility", or error handling beyond what was
  asked or what the contract requires.
- If you write 200 lines and it could be 50, rewrite it. Ask: "would a senior
  engineer call this overcomplicated?"

## 3. Surgical changes

- Touch only what the task requires. Don't "improve" adjacent code, comments, or
  formatting; match existing style even if you'd do it differently.
- Clean up orphans **your** changes create (unused imports/vars). Don't delete
  pre-existing dead code — mention it instead.
- Every changed line should trace directly to the request.

## 4. Goal-driven execution

- Turn tasks into verifiable goals: "fix bug" → "write a failing test that
  reproduces it, then make it pass".
- For multi-step work, state a brief plan with a verify step each, then loop until
  green.

---

## Project-specific guardrails

These override the generic guidance where they conflict — they are why this repo
exists.

- **Design fidelity is the bar.** The UI must look like it belongs in
  `simulateurs.sinvestir.fr`. Pull tokens (colours, Lexend, radii) from
  `docs/DESIGN.md`; don't invent a look. When unsure, match the captures in
  `debug/` rather than guessing.
- **Embeddable & autonomous.** The simulator is a self-contained component meant
  to drop into the S'investir suite and to be embedded from `sinvestir.fr`. Keep
  dependencies few, avoid app-shell assumptions (no required sidebar/footer),
  drive state from props/URL params. Don't couple the simulator to the demo page.
- **Honest backtest, no invented numbers.** Results are *retrospective*
  simulations over real historical prices. Never fabricate or hard-code price
  data; always keep the risk/retrospective disclaimer visible.
- **Config over hard-coding.** Brand values, defaults (currency, default coin,
  date range), and the price source live in config/env, not scattered literals.
- **Clear front/back boundary.** The Python backend owns the calculation behind a
  small, stable HTTP contract; the front consumes it. Freeze the contract before
  building UI against it (see `docs/TODO.md` phase 0).

## Conventions

- **Front**: TypeScript, Next.js (App Router), Tailwind + shadcn/ui; ESLint +
  Prettier must pass. Keep components small and reusable.
- **Back**: Python 3.11+, strict type hints; `mypy --strict` and `ruff` must
  pass. New calculation logic ships with tests.
- Code in english (comments included). Product copy & documentation in french.
- Tests frequently — the backtest engine especially is verified against
  hand-computed cases.

## Git

- Commit often. Each commit is self-contained: it builds, it makes sense on its own, and it does one thing. A feature spanning backend + frontend can still be one commit if the pieces only make sense together, but unrelated cleanups go in their own commit.
- Commit messages in English, following [Conventional Commits](https://www.conventionalcommits.org/) — `<type>(optional scope): description`.
- **Type**: one of `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`. An optional scope names the area (e.g. `feat(ingestion):`). A breaking change adds `!` before the colon (`feat!:`). Any change to the public contract is breaking and is a SemVer-major event.
- **Subject**: single line, imperative mood, lower-case after the colon, no trailing period. Keep it tight.
- **Body** (only when needed): blank line after subject, then a short paragraph explaining the *why*. If there are multiple distinct points, use one bullet (`- `) per point instead of prose.
- No `Co-Authored-By` trailers unless explicitly requested.
