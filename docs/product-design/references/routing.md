# Routing

Load focused references and existing rule owners. Do not restate a rule here
 when another file already owns it.

## Surface routing

| Surface or task | Load |
| --- | --- |
| Work Out home, set logging, add/edit/delete set sheets | `product-judgment.md`, `surfaces.md`, `resilience.md` |
| Onboarding steps | `surfaces.md`, `copy.md`, `resilience.md` |
| Options menu | `surfaces.md`, `.cursor/rules/harsh-simplify-freeze.mdc` |
| Rest timer UI | `surfaces.md`, `resilience.md` |
| Full UI review | `interface-quality.md`, `surfaces.md`, `resilience.md` |
| Copy-only task | `copy.md`, `surfaces.md` |
| Learn mode | all files in `references/`, `coverage-gaps.md`, `lint-candidates.md`, `taxonomy.md` |

## Existing rule owners

Use the existing repo owner instead of duplicating its rule text.

| Need | Canonical owner |
| --- | --- |
| Figma gaps, sibling reuse, avoid new visual language | `.cursor/rules/design-fills.mdc` |
| Tokens, radii, borders, transparent colors | `.cursor/rules/figma-design-tokens.mdc` |
| Typography metrics and author-lowercase rule | `.cursor/rules/typography-text-case.mdc` |
| Icon wrappers and no raw Central Icons in screens | `.cursor/rules/icons.mdc` |
| Panel timing and no RN Modal for menus/dropdowns | `.cursor/rules/panel-motion.mdc` |
| Shared press tint behavior | `.cursor/rules/pressed-content-color.mdc` |
| Scrollable fixed viewports and fade offsets | `.cursor/rules/scroll-fade.mdc` |
| Button label and icon alignment | `.cursor/rules/button-content-alignment.mdc` |
| Lowest true layer and contract-test policy | `.cursor/rules/component-layering.mdc` |
| Frozen keep-as-is patterns | `.cursor/rules/harsh-simplify-freeze.mdc` |
| UI build mechanics, Figma inspection, composition, tests | Global skill `harsh-product-design` → **Build mechanics** (Implement; Harden only when composition is required) |

## Domain evidence routing

These code paths own product behavior that UI guidance must respect.

| Behavior | Source |
| --- | --- |
| First set of the day creates the workout | `src/stores/todaySlice.ts`, `docs/blueprint.md` |
| Warm-up threshold and bodyweight handling | `src/domain/warmup.ts`, `docs/blueprint.md` |
| Last set today seeds add-set defaults | `src/domain/defaults.ts`, `docs/blueprint.md` |
| Standard-set numbering and CTA copy | `src/domain/set-labels.ts` |
| Session total shows standard sets only | `src/domain/session-totals.ts` |
| Weight ranges and increments | `src/domain/ranges.ts`, `src/data/exercise-catalogue.ts` |

## Review citation rule

When you cite guidance in a response:

- Prefer `rule/{stable-id}` when the decision is documented in
  `docs/product-design/references/`.
- Prefer the owning `.cursor/rules/*.mdc` path when this file routes to an
  existing rule.
- Prefer a code path when the decision is directly encoded in product logic.
