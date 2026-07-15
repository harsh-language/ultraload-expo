---
name: build-ui
description: >-
  Build or edit UltraLoad screens and UI when Figma may be full, partial, or
  missing. Use when implementing a new page, sheet, or visual flow so the result
  matches the existing design language without inventing parallel patterns.
---

# Build UI (Figma optional)

Compose from the app's existing design language. Figma wins where present; the codebase fills gaps.

## Steps

1. **Figma** — If a file/frame is linked, inspect it. Map what exists vs missing.
2. **Siblings** — Read [`taxonomy.md`](../../../taxonomy.md) for nearby screens, shells, and component homes.
3. **Compose** — Reuse existing shells/primitives (`OnboardingLayout`, `AppBottomSheet`, inputs, buttons, `ScrollFadeView`). Do not invent parallel components for one screen.
4. **Apply project rules** — design fills, Figma tokens, typography/text case, icons, component layering, scroll fade.
5. **Tests** — When shared pure logic changes, add/update contract tests per the component-layering checklist.
6. **Call out guesses** — In the summary, list what was Figma-backed vs inferred from siblings/code.

## Do not

- Catalog or re-document individual component styles inside this skill — the code is the source of truth
- Add one-off colors, radii, type scales, or button styles when an existing pattern is close enough
- Fix shared primitives for a single-screen quirk — fix at the lowest true layer
