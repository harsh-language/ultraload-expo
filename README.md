# UltraLoad

Personal, offline strength-training app for one experienced lifter. Log ad-hoc gym sessions with almost no friction (notepad model — first set of the day creates that day’s record) and track progress via **total weight moved**.

React Native (Expo 56), iOS + Android, 100% offline, dark mode only. No splits, no cloud.

**Last updated:** 2026-07-28

## Status (v1)

| Area | Status |
|------|--------|
| App shell, splash, onboarding | Built |
| Work Out — log today’s sets | Built |
| Rest timer | Built |
| Settings — profile, plan, units, presets | Built (U3) |
| History list / chart / session detail | Not built (U4–U5) |
| Export / import / reset | Not built (U6) |
| App Store release | Not built (U7) |

Full screen/flow map: [`taxonomy.md`](taxonomy.md)

## Quick start

1. Copy `.env.example` → `.env` and set `CENTRAL_LICENSE_KEY`
2. First-time: `npm run install:deps` (or `direnv allow` then `npm install`)
3. `npx expo start`

Agent conventions: [`AGENTS.md`](AGENTS.md)

## Docs

| Path | Purpose |
|------|---------|
| [`taxonomy.md`](taxonomy.md) | Built vs stub screens, flows, code locations |
| [`docs/blueprint.md`](docs/blueprint.md) | Product blueprint (requirements, rules, screens) |
| [`docs/blueprint-status.yaml`](docs/blueprint-status.yaml) | Blueprint coverage status |
| [`docs/ultraload-v1-implementation-plan.md`](docs/ultraload-v1-implementation-plan.md) | Staged build plan (U0–U7) |
| [`docs/product-design/`](docs/product-design/) | Local product-design decisions and references |
| [`docs/agentic-product-design.md`](docs/agentic-product-design.md) | Agentic product-design notes |

## Layout

| Path | Purpose |
|------|---------|
| `src/` | App source (screens, components, domain, stores, db, theme) |
| `src/theme/motion.ts` | House springs, press scale, reduced-motion helpers |
| `src/data/exercise-catalogue.ts` | Built-in exercise catalogue |
| `__tests__/` | Jest unit/contract tests (`npm test`) |
| `assets/` | Fonts and static assets |
| `scripts/` | Project scripts |
| `ios/` | Native iOS project |

## Skills / cheatsheets

None in this repo (no `skills/` or `cheatsheets/` directories).
