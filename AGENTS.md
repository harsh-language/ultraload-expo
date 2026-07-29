# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Design tokens

UI spacing, radius, borders, and colors come from Figma variables in [`src/theme/tokens.ts`](src/theme/tokens.ts). Regenerate with `figma_export_tokens` — never edit that file by hand. For 8-digit transparent tokens in SVG or opacity-only APIs, use [`resolveColorToken`](src/theme/resolveColorToken.ts). See [`.cursor/rules/figma-design-tokens.mdc`](.cursor/rules/figma-design-tokens.mdc) for mapping and conventions.

## Motion

Panel open / close / move: house spring via `panelSpringConfig` in
[`src/theme/motion.ts`](src/theme/motion.ts) — **damping 0.9**, **response 0.15s**.
Press scale **0.97** / **150ms** via `ScaledPressable`.
See [`.cursor/rules/panel-motion.mdc`](.cursor/rules/panel-motion.mdc).

## Dependencies

Central Icons requires `CENTRAL_LICENSE_KEY` in `.env` (copy from `.env.example`).

- Outlined: `central-icons` → `@central-icons-react-native/square-outlined-radius-0-stroke-2`
- Filled: `central-icons-filled` → `@central-icons-react-native/square-filled-radius-0-stroke-2`

- First-time install: `npm run install:deps`
- With [direnv](https://direnv.net/): run `direnv allow` once, then `npm install` works normally

## Project map

Built vs stub screens, flows, and code locations: [`taxonomy.md`](taxonomy.md).

## Product design

When shaping, editing, or reviewing user-facing UI, load the
`harsh-product-design` skill.

Applies to:
- screens and components
- copy, interaction, accessibility, and states
- build/edit work when Figma is full, partial, or missing

Skip:
- backend-only work with no user-visible effect
- config, docs, and tests with no UI impact

The skill selects its mode automatically from the request. Implement and
Harden include Build mechanics (Figma inspection, composition, contract-test
follow-through) and a post-change auto-learn pass that only proposes guidance
for human approval.

Local product decisions live in [`docs/product-design/`](docs/product-design/).

**Blueprint precedence:** Later production decisions override earlier
`docs/blueprint.md` rows. When a decision changes flow, consequence, or data
semantics, rewrite the blueprint in the same change so it matches shipped
intent (`rule/later-product-decisions-update-the-blueprint`).

## Build stage

U4 in progress — History list + session detail + progress math. Chart remains a stub until U5.

Next after U4 is U5 — History chart with filters and muscle-group weighting.

## Typography

Font metrics: [`src/theme/typography.ts`](src/theme/typography.ts). Case: [`src/theme/textCase.ts`](src/theme/textCase.ts). Author UI copy in lowercase; components enforce case at render.

## Icons

Screens import wrappers from [`src/components/icons/`](src/components/icons/). New icons use `createIcon` — do not import raw Central Icons in screens.

## Data

SQLite is the source of truth. Zustand is a write-through cache ([`src/stores/`](src/stores/), [`src/db/`](src/db/)).

## Tests

Run `npm test`. Contract tests for shared primitives follow [`.cursor/rules/component-layering.mdc`](.cursor/rules/component-layering.mdc).
