# Resilience

Load when work touches loading, empty, sparse, disabled, destructive, or stale
 states.

Document only states the product can actually enter today.

## rule/empty-day-still-exposes-the-primary-job
Status: accepted
Scope: Work Out home when no sets exist yet today
Rule: An empty day still lands on a functional logging surface, not an
instructional dead end. The primary add-set action stays available immediately.
Why: The notepad model depends on immediate capture.
Exceptions: None documented.
Source: `src/screens/WorkOutScreen.tsx`, `docs/blueprint.md`
Bad example: Replacing the empty state with explanatory copy that hides the add
flow behind another step.
Good example: `footerEmptyButtons` shows `add new set` and `start rest timer`.

## rule/sparse-warmup-only-sessions-keep-context-without-fake-progress
Status: accepted
Scope: Work Out home and future session summaries
Rule: When the user has logged only warm-up sets, keep the session visible but
do not show a progress total.
Why: The session exists and should be reviewable, but the product should not
claim meaningful progress where there is none.
Exceptions: None documented.
Source: `src/components/TodaySessionTitleBar.tsx`, `src/domain/session-totals.ts`
Bad example: Hiding the session log entirely or showing `0 kg` as if it were a
real progress result.
Good example: `workout` renders, but `totalLabel` stays undefined until a
standard set exists.

## rule/no-plan-exercises-means-no-add-set-surface
Status: accepted
Scope: add-set sheet
Rule: If there are no plan exercises, the add-set sheet should not render.
Why: The surface has no valid choices without an exercise in the plan.
Exceptions: None documented in current code.
Source: `src/components/AddSetSheet.tsx`
Bad example: Presenting an add-set UI with broken controls or placeholder
exercise text when `exerciseIds` is empty.
Good example: `if (exerciseIds.length === 0) { return null; }`

## rule-disabled-onboarding-ctas-block-incomplete-required-input
Status: accepted
Scope: onboarding progression
Rule: Disable progression when the current step's required input is incomplete
or when completion is already in progress.
Why: The user should never advance into an invalid profile or submit the same
finish action twice.
Exceptions: Steps with prefilled optional presets can remain enabled.
Source: `taxonomy.md`, `src/screens/onboarding/WarmUpStep.tsx`, `src/screens/onboarding/BodyweightStep.tsx`, `src/screens/onboarding/ExercisePickerStep.tsx`
Bad example: Allowing the user to continue from profile with no bodyweight or
from exercise selection with zero exercises.
Good example: `actionDisabled={completing}` in `WarmUpStep` and gating in the
required earlier steps.

## rule-destructive-flows-repeat-target-before-confirm
Status: accepted
Scope: set deletion and future destructive surfaces
Rule: Destructive flows must repeat the specific thing being removed before the
user confirms.
Why: Confirmation is only useful when it helps the user verify scope and
consequence.
Exceptions: None documented in current built flows.
Source: `src/components/DeleteSetSheet.tsx`
Bad example: A delete sheet with only a button and no set context.
Good example: `DeleteSetPreview` plus a title such as `delete set 02`.

## rule-stale-docs-go-to-coverage-gaps-not-silent-normalization
Status: proposed
Scope: learn mode and skill maintenance
Rule: When code has advanced past a planning document, log the mismatch in
`coverage-gaps.md` instead of silently normalizing the docs into the skill as if
they matched.
Why: The skill should stay traceable about what is implemented versus what is
merely planned.
Exceptions: None yet; requires human confirmation before becoming accepted.
Source: `taxonomy.md`, `src/screens/WorkOutScreen.tsx`, `src/components/DeleteSetSheet.tsx`, `src/components/RestTimer.tsx`
Bad example: Treating `taxonomy.md` as current truth for rest timer or set
editing without acknowledging the implemented code.
Good example: Learn mode records the contradiction and asks for confirmation.
