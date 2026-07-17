# Surfaces

Load when work touches a built UltraLoad surface. Start with the repeated
 decisions in Work Out and set logging, then use lighter sections for adjacent
 built surfaces.

## Work Out and set logging

Canonical homes:

- `src/screens/WorkOutScreen.tsx`
- `src/components/AddSetSheet.tsx`
- `src/components/DeleteSetSheet.tsx`
- `src/components/LogRow.tsx`
- `src/components/AppBottomSheet.tsx`
- `src/components/TodaySessionTitleBar.tsx`
- `src/domain/set-labels.ts`
- `src/domain/defaults.ts`
- `src/domain/warmup.ts`
- `src/domain/session-totals.ts`

## rule/log-row-uses-w-for-warmups-and-zero-padded-standard-index
Status: accepted
Scope: any surface that renders today's set rows or a set preview
Rule: Warm-up sets display `W`. Standard sets display a zero-padded two-digit
index (`01`, `02`, ...).
Why: The log needs a compact, scannable distinction between preparation sets
and progress-driving sets.
Exceptions: None documented in current built surfaces.
Source: `src/components/LogRow.tsx`, `src/components/DeleteSetSheet.tsx`, `src/domain/set-labels.ts`
Bad example: Showing the literal word `warmup` in the row prefix or rendering
standard sets as `1`, `2`, `3`.
Good example: `W` in `LogRow` and `DeleteSetPreview`, `formatSetIndex()` for
standard sets.

## rule/add-set-sheet-is-slider-first
Status: accepted
Scope: add/edit set surface
Rule: Reps and weight are set with sliders, not text entry. Reps use `1` to
`20` in steps of `1`. Weight uses the exercise-specific range and increment.
Why: The product is optimized for low-friction in-gym logging on known exercise
ranges.
Exceptions: None documented in current code.
Source: `src/components/AddSetSheet.tsx`, `src/domain/ranges.ts`, `src/data/exercise-catalogue.ts`
Bad example: Replacing the sliders with free text fields for standard set
logging.
Good example: `InputSlider` for reps and a separate `InputSlider` for weight.

## rule/add-set-defaults-follow-current-session-context
Status: accepted
Scope: add-set entry and exercise navigation inside the sheet
Rule: A new add-set draft should inherit the selected exercise's last logged
set from today, including reps and weight, then re-evaluate warm-up state.
Why: The user is usually repeating or adjusting a live working weight, not
starting from scratch on each entry.
Exceptions: Edit mode loads the chosen set directly and disables exercise
navigation.
Source: `src/components/AddSetSheet.tsx`, `src/domain/defaults.ts`
Bad example: Navigating to another exercise but leaving stale values from the
previous exercise, or resetting to generic defaults every time.
Good example: `applyExerciseDraft()` and `initializeAddDraft()`.

## rule/manual-warmup-toggle-is-visible-and-local
Status: accepted
Scope: add/edit set flow
Rule: The warm-up toggle stays visible in the sheet footer and any manual
override applies only to the current set.
Why: The user needs a fast escape hatch when the product's auto-tagging guess is
wrong, without rewriting the global warm-up rule.
Exceptions: None documented in current code.
Source: `docs/blueprint.md`, `src/components/AddSetSheet.tsx`, `src/domain/warmup.ts`
Bad example: Hiding the toggle behind a secondary screen or treating a manual
toggle as a permanent setting change.
Good example: `Warmup` lives beside the primary CTA and `warmUpTouched` only
affects the current draft.

## rule/workout-home-reorganizes-around-log-state
Status: accepted
Scope: Work Out home
Rule: The home screen has two distinct compositions. Empty day: centered,
stacked action buttons. Logged day: scrollable log with pinned title and footer
actions.
Why: The user's primary job changes once a session exists.
Exceptions: When the rest timer is visible, the add-set action lifts above the
timer bar instead of sharing the normal footer row.
Source: `src/screens/WorkOutScreen.tsx`
Bad example: Treating empty, active, and timer-running states as one static
layout.
Good example: `hasSets` and `timerBarVisible` drive different overlays.

## rule/show-session-total-only-when-standard-work-exists
Status: accepted
Scope: Work Out title bar and any future session summaries
Rule: Show the session total only when the workout contains at least one
standard set.
Why: Warm-up-only sessions should not imply progress volume.
Exceptions: None documented.
Source: `src/components/TodaySessionTitleBar.tsx`, `src/domain/session-totals.ts`
Bad example: Showing `0 kg` or a computed total when the user has only logged
warm-up sets.
Good example: `hasStandardSets()` gates `totalLabel`.

## rule/delete-sheet-repeats-the-set-being-removed
Status: accepted
Scope: set deletion flow
Rule: The delete confirmation surface should repeat the exact set being deleted
using the same `W` or set index convention as the main log.
Why: The user must verify target identity before confirming a destructive
action.
Exceptions: The preview can differ visually from `LogRow` so the sheet gradient
shows through.
Source: `src/components/DeleteSetSheet.tsx`
Bad example: Deleting from a generic confirmation with no set preview.
Good example: `DeleteSetPreview` mirrors the row content while using sheet-local
styling.

## Options menu

Canonical homes:

- `src/components/OptionsMenuDropdown.tsx`
- `src/components/useHomepageOptionsMenu.tsx`
- `.cursor/rules/harsh-simplify-freeze.mdc`

## rule/options-menu-is-a-lightweight-panel-not-navigation-shell
Status: accepted
Scope: Work Out title-bar menu
Rule: Keep the options menu as a small anchored panel with direct actions, not
as a full-screen shell or modal flow.
Why: History, settings, and reset are secondary to the logging surface.
Exceptions: None documented in current built code.
Source: `src/components/OptionsMenuDropdown.tsx`, `.cursor/rules/panel-motion.mdc`, `.cursor/rules/harsh-simplify-freeze.mdc`
Bad example: Replacing the anchored menu with a separate navigation shell for
the same three actions.
Good example: Absolute overlay, anchored dropdown, and direct menu item presses.

## Onboarding

Canonical homes:

- `src/screens/onboarding/BodyweightStep.tsx`
- `src/screens/onboarding/ExercisePickerStep.tsx`
- `src/screens/onboarding/RestTimerStep.tsx`
- `src/screens/onboarding/WarmUpStep.tsx`
- `src/screens/onboarding/OnboardingLayout.tsx`

## rule/onboarding-presets-use-prefilled-sliders-not-empty-forms
Status: accepted
Scope: rest and warm-up onboarding steps
Rule: Preset steps should be fast to accept because they are prefilled. The
user can adjust the slider, but the default path is a quick confirm.
Why: Setup should front-load only what the product truly needs, then get the
user into Work Out quickly.
Exceptions: Exercise selection still requires at least one deliberate choice.
Source: `docs/blueprint.md`, `src/screens/onboarding/WarmUpStep.tsx`, `taxonomy.md`
Bad example: Turning rest or warm-up setup into a blank form that requires
typed input before progress.
Good example: Warm-up and rest steps use sliders with defaults and a simple CTA.

## Rest timer

Canonical homes:

- `src/components/RestTimer.tsx`
- `src/hooks/useRestTimer.ts`
- `src/domain/rest-timer.ts`
- `src/stores/timerSlice.ts`

## rule/rest-timer-stays-optional-and-separate-from-recording
Status: accepted
Scope: Work Out footer and timer bar
Rule: The rest timer is user-triggered and separate from recording a set. It
does not auto-start after a set is saved.
Why: UltraLoad is a notepad first, with the timer as an optional assist.
Exceptions: None documented.
Source: `docs/blueprint.md`, `src/screens/WorkOutScreen.tsx`
Bad example: Starting the timer automatically after every recorded set.
Good example: Separate `start timer` / `start rest timer` buttons that call
`startTimer(restTimerSeconds)`.
