# Product Judgment

Load when work changes the user's task, default, consequence, navigation,
 interaction surface, or reachable states.

## Product brief

- User: one experienced lifter logging personal workouts offline
- Primary job: log today's set with almost no friction
- Primary surface: `src/screens/WorkOutScreen.tsx`
- Product object: today's workout record and its grouped sets
- Outcome: capture a set quickly, keep context, and reflect progress without
  adding ceremony
- Non-goals: workout start flows, training splits, extra configuration, and UI
  that asks the user to manage state the product can derive

## rule/notepad-first-set-creates-day
Status: accepted
Scope: Work Out home and any future logging entry point
Rule: Do not introduce a separate "start workout" action. The first logged set
creates the workout for that calendar day.
Why: UltraLoad is a notepad, not a session manager. Logging should begin at the
moment of capture, not behind a setup step.
Exceptions: None documented in current code or approved docs.
Source: `docs/blueprint.md`, `src/stores/todaySlice.ts`, `taxonomy.md`
Bad example: A primary CTA that asks the user to create or start a workout
before they can log the first set.
Good example: `WorkOutScreen` shows `add new set` even when `workout` is null,
and `recordSet()` persists against today's calendar date.

## rule/standard-sets-drive-progress
Status: accepted
Scope: session totals, progress UI, warm-up handling, and any review of logged
data
Rule: Only standard sets count toward progress and day totals. Warm-up sets are
visible but excluded from progress math.
Why: The product measures strength trend through work sets, while still showing
preparation context in the log.
Exceptions: None documented in current code.
Source: `docs/blueprint.md`, `src/domain/session-totals.ts`, `src/domain/warmup.ts`
Bad example: Showing warm-up volume inside the day total or using warm-up sets
as the basis for future reference weights.
Good example: `hasStandardSets()` gates the title-bar total, and
`getSessionTotalWeightMoved()` skips `warmUp` sets.

## rule/auto-tag-from-real-lifting-context
Status: accepted
Scope: add/edit set flow, warm-up logic, and future settings that affect
warm-up behavior
Rule: Auto-tagging must be derived from real lifting context, not guessed UI
copy. Use the history-derived reference weight (BR15).
Why: Warm-up classification is a product decision with training semantics, not
just a presentation detail.
Exceptions: When auto-tagging is disabled or the reference needed for
the rule is unavailable, do not auto-tag.
Source: `docs/blueprint.md`, `src/domain/warmup.ts`, `src/screens/onboarding/WarmUpStep.tsx`
Bad example: Treating all low absolute weights as warm-ups or baking a fixed kg
cutoff into the UI.
Good example: `shouldAutoTagWarmUp()` applies BR15 history-derived thresholds uniformly.

## rule/defaults-follow-todays-last-set
Status: accepted
Scope: add-set entry defaults and exercise navigation inside the sheet
Rule: Default a new set to the last set logged today for that exercise. If
there is no set yet, fall back to the exercise's slider minimum and `1` rep.
Why: Logging should feel like continuing a live session, not re-entering common
values.
Exceptions: Edit mode uses the selected set's existing values instead.
Source: `docs/blueprint.md`, `src/domain/defaults.ts`, `src/components/AddSetSheet.tsx`
Bad example: Resetting every new set to generic app-wide defaults even when the
user has already logged the same exercise today.
Good example: `getExerciseDraft()` reads `getLastSetToday()` before falling
back to the slider range minimum.
