# Exemplar: add-set sheet

Status: accepted evidence
Primary surface: `src/components/AddSetSheet.tsx`
Supporting sources: `src/domain/defaults.ts`, `src/domain/set-labels.ts`, `src/domain/warmup.ts`
Commits: `d97cc25`, `062124f`, `09eee97`

## Decision this exemplar supports

- `rule/add-set-sheet-is-slider-first`
- `rule/add-set-defaults-follow-current-session-context`
- `rule/manual-warmup-toggle-is-visible-and-local`
- `rule/logging-ctas-name-the-action-and-object`

## Good

- Uses `AppBottomSheet` instead of a one-off editor shell.
- Loads exercise-specific defaults from today's last set via
  `getLastSetToday()`.
- Recomputes auto-tag warm-up state from `shouldAutoTagWarmUp()`.
- Keeps the manual `Warmup` toggle visible in the footer beside the primary CTA.
- Uses explicit CTA labels from `getAddSetRecordLabel()` /
  `getEditSetRecordLabel()`.
- Uses sliders for reps and weight, with exercise-specific weight range and
  increment.

## Bad to avoid

- Replacing reps or weight with free text input for routine logging.
- Hiding warm-up override in a separate settings flow.
- Resetting every draft to generic defaults instead of today's last set.
- Using generic CTA copy such as `save` or `continue` when the surface knows
  whether it is recording a warm-up set or a numbered standard set.

## Why this matters

This sheet is the highest-frequency interaction in the product. It shows the
repo's current standard for low-friction capture: context-carrying defaults,
explicit action copy, and one visible override for the product's auto-tagging
guess.
