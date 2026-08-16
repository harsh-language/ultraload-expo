# UltraLoad

Personal, offline strength-training app for one experienced lifter. Log ad-hoc gym sessions with almost no friction (notepad model — first set of the day creates that day’s record) and track progress via **total weight moved**.

React Native (Expo 56), iOS + Android, 100% offline, dark mode only. No splits, no cloud.

**Last updated:** 2026-08-16

## Status (v1)

| Area | Status |
|------|--------|
| App shell, splash, onboarding | Built |
| Work Out — log today’s sets | Built |
| Rest timer | Built |
| Settings — profile, plan, units, presets | Built (U3) |
| History list + session detail | Built (U4) |
| History chart + shared filters | Built (U5) — duration / muscle, then direct exercise; edge-park scroll when three filters; shared menu with options; session dates as `31 oct`; BR13 weighting |
| Progress math (day totals / % / muscle weighting) | Built (U4–U5) |
| Export / import / reset | Not built (U6; DEV reset in options menu) |
| App Store release | Not built (U7) |

## Quick start

1. Copy `.env.example` → `.env` and set `CENTRAL_LICENSE_KEY`
2. First-time: `npm run install:deps` (or `direnv allow` then `npm install`)
3. `npx expo start`

Agent conventions: [`AGENTS.md`](AGENTS.md)

## Docs

| Path | Purpose |
|------|---------|
| [`docs/blueprint.md`](docs/blueprint.md) | Product blueprint (requirements, rules, screens) |
| [`docs/blueprint-status.yaml`](docs/blueprint-status.yaml) | Blueprint coverage status |
| [`docs/demo-data.md`](docs/demo-data.md) | Canonical DEV demo workouts + rolling today rules |
| [`docs/ultraload-v1-implementation-plan.md`](docs/ultraload-v1-implementation-plan.md) | Staged build plan (U0–U7) |
| [`docs/product-design/`](docs/product-design/) | Local product-design decisions and references |
| [`docs/agentic-product-design.md`](docs/agentic-product-design.md) | Agentic product-design notes |
| [`docs/Strength Standards Report.pdf`](docs/Strength%20Standards%20Report.pdf) | Catalogue range reference (male 1RM @ 75kg) |

## Layout

| Path | Purpose |
|------|---------|
| `src/` | App source (screens, components, domain, stores, db, theme) |
| `src/theme/motion.ts` | House springs, press scale, reduced-motion helpers |
| `src/data/exercise-catalogue.ts` | Built-in exercise catalogue |
| `src/db/demoData.ts` / `devSeed.ts` | DEV demo seed (gated by `__DEV__` toggle) |
| `__tests__/` | Jest unit/contract tests (`npm test`) |
| `assets/` | Fonts and static assets |
| `scripts/` | Project scripts |
| `ios/` | Native iOS project |

## Skills / cheatsheets

None in this repo (no `skills/` or `cheatsheets/` directories).
