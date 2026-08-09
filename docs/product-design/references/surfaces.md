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

## Settings

Canonical homes:

- `src/screens/SettingsScreen.tsx`
- `src/screens/AddExercisesScreen.tsx`
- `src/components/InputComboUnit.tsx`
- `src/components/InputHeightField.tsx`
- `src/domain/profile-inputs.ts`
- `src/domain/height-input.ts`
- `src/stores/planSlice.ts`

## rule/settings-profile-saves-valid-drafts-immediately
Status: proposed
Scope: Settings profile fields (body weight, height, age)
Rule: Persist a profile field as soon as the draft is valid. Body weight is
required and must stay in range; empty drafts do not overwrite the last saved
value. Height and age may be cleared; empty saves as `0` (unused / future
wiring) and displays blank. Incomplete height (feet only) is not saved; blur
reverts to the last saved value. Tap outside / drag dismisses the keyboard.
Why: Leaving Settings via back should keep what the user already typed when it
was valid, without a separate save control.
Exceptions: none.
Source: `src/screens/SettingsScreen.tsx`, `parseAgeForSave`, `parseHeightForSave`
Bad example: Saving profile fields only on blur so a back press drops a valid
draft, or forbidding empty height/age.
Good example: `handleBodyweightChange` / `handleHeightChange` / `handleAgeChange`
write through when valid; clear height/age → `0`.

## rule/plan-remove-is-reversible-hide-without-confirm
Status: accepted
Scope: Settings exercise tags and Add Exercises toggles
Rule: Removing an exercise from the workout plan only updates the plan list.
Logged sets are never deleted. The exercise disappears from pickers and from
today’s / history visibility filters until re-added; re-adding restores those
records. Do not show a confirmation sheet — removal is reversible. Settings
exercise-tag removals persist immediately. Add Exercises stages all additions
and removals in one draft: close discards the draft; check saves the complete
draft. Keep the last-plan-exercise guard (cannot remove the final exercise).
Why: The consequence is temporary hide, not permanent data loss, so a confirm
step adds ceremony without protecting anything.
Exceptions: True destructive data wipe (dev reset / future export-delete) stays
behind its own confirmations.
Source: `docs/blueprint.md` FL8/BR3 (updated 2026-07-25),
`src/screens/SettingsScreen.tsx`, `src/screens/AddExercisesScreen.tsx`,
`WorkOutScreen` plan-filtered `visibleLoggedExercises`
Bad example: Confirm bottom sheet or deleting logged rows when the plan changes.
Good example: Settings `handleRemove` persists directly; Add Exercises toggles
local draft state and only its check action calls `updatePlan`.

## rule/plan-exercise-reorder-shifts-siblings-live
Status: proposed
Scope: Settings plan exercise tag list reorder
Rule: While dragging a plan exercise, crossed siblings should animate into the
opened gap in real time. On drop, clear transforms and commit the new order in
the same update (optimistic store write) so the list does not jump.
Why: Drop-only reordering makes the release feel broken even when the final
order is correct; live displacement matches the user’s spatial expectation.
Exceptions: none — plan tags are reorder/remove only; no expandable override
panels.
Source: `src/components/PlanExerciseTagRow.tsx`, `src/domain/reorder.ts`
(`siblingDragOffset`), `src/screens/SettingsScreen.tsx`, `src/stores/planSlice.ts`
Bad example: Only moving the grabbed row during drag, then teleporting every
row on release.
Good example: `dragHoverIndex` drives sibling offsets with `panelSpringConfig`
during drag; drop resets offsets instantly and `updatePlan` sets Zustand before
awaiting SQLite.

## rule/no-per-exercise-override-ui-this-version
Status: proposed
Scope: Settings and any surface that might expose catalogue per-exercise knobs
Rule: Do not ship UI for per-exercise warm-up %, slider range, or increment
overrides in this version. Catalogue per-exercise fields (`sliderRange`,
`increment`, `muscleMultipliers`, and related weight math) remain in data and
domain code for Add Set, progress calculations, and future versions.
Why: Override editing was removed from the design as overkill; keeping the
underlying per-exercise knowledge preserves logging quality without extra
Settings complexity.
Exceptions: Global warm-up % / auto-tag and per-set warm-up toggle (BR5) stay.
Source: `docs/blueprint.md` F10/BR16/stage 3, `src/domain/ranges.ts`,
`src/data/exercise-catalogue.ts`
Bad example: Expandable Settings panels or a common-increment toggle that writes
per-exercise overrides.
Good example: Settings plan tags are reorder/remove only; Add Set reads catalogue
range and increment directly.

## History

Canonical homes:

- `src/screens/HistoryListScreen.tsx`
- `src/screens/SessionDetailScreen.tsx`
- `src/screens/HistoryChartScreen.tsx`
- `src/components/HistoryNavigation.tsx`
- `src/components/HistoryEmptyState.tsx`
- `src/domain/progress.ts`

## rule/history-percent-is-derived-never-stored
Status: proposed
Scope: History list, session detail, and progress math
Rule: Day and exercise % change are computed from workout trees on read. Do not
persist % columns. Editing a past set updates progress by reloading trees and
recomputing.
Why: Downstream recalc (BR12) must stay free of cascade writes, and progress
rules stay testable as pure functions.
Exceptions: None.
Source: `src/domain/progress.ts`, `src/stores/historySlice.ts`,
`docs/blueprint.md` BR8–BR12
Bad example: Writing day-% into SQLite on every set edit.
Good example: `buildHistoryListRows()` over `listWorkoutTrees()` after mutate.

## rule/history-hides-plan-removed-exercises
Status: proposed
Scope: History list and session detail
Rule: Filter logged exercises to the active plan before totals and % (same as
Work Out). Past sets stay in SQLite; re-enabling restores them in History.
Why: BR3 — removal is hide, not delete.
Exceptions: None.
Source: `src/domain/progress.ts` `filterWorkoutByPlan`,
`src/screens/HistoryListScreen.tsx`, `src/screens/SessionDetailScreen.tsx`
Bad example: Showing removed-plan exercises in History day totals.
Good example: Pass `exerciseIds` from `planSlice` into `buildHistoryListRows`.

## rule/history-list-shows-rest-days-for-calendar-gaps
Status: proposed
Scope: History list
Rule: The list is a continuous calendar from the oldest active session (has ≥1
standard set) through today. Rest days sit above the chronologically previous
session and share one padded group (`py s-5`, bottom border, row height `s-11`).
Rest rows show a faded Para-2 date only and open session detail on tap. A
session with no rests above it is still its own group with the same chrome.
Warm-up-only days are rest rows on the list (not active sessions); opening them
still shows the warm-up sets on session detail.
Why: Rest clusters read as recovery attached to the last workout; equal group
chrome keeps sessions comparable when there is no gap. History “active” means
standard work only, matching progress math.
Exceptions: Empty history still uses the shared empty state (no rest-only list).
Source: `src/domain/progress.ts` `fillHistoryCalendarGaps` /
`groupHistoryListRows` / `buildHistoryListRows`, `src/screens/HistoryListScreen.tsx`,
`src/components/LogRow.tsx`, `docs/blueprint.md` FL5,
Figma `2754:8668` / `2755:8711`
Bad example: Showing only logged session dates with silent multi-day holes,
different row height for grouped vs lone sessions, or treating warm-up-only days
as active history rows.
Good example: Gap fill + group wrapper with rests above their session; rest
`onPress` → `SessionDetail`.

## rule/session-detail-has-no-screen-mode
Status: proposed
Scope: Session detail
Rule: Session detail has no read-only vs edit toggle. Set edit/delete icons are
always available. Add-set is a primary `IconButton` (`button-icon-1`, plus only)
in the title bar on both empty and logged days. Empty days show centered “no
sets recorded” with no body CTA. Mutates go through Add Set / Delete sheets,
same as Work Out. Set-row hit targets are icon-only (no whole-row press).
Why: Sheets already confirm every mutate, so a screen-level mode adds friction
without reducing accidents. Title-bar add-set keeps one entry point across empty
and logged layouts. Empty rest days stay openable so the notepad can fill gaps
without a separate create flow.
Exceptions: None.
Source: `src/screens/SessionDetailScreen.tsx`, `docs/blueprint.md` FL6,
Figma `2104:8839`
Bad example: A pencil toggle that hides actions until edit, a second add-set in
the body/footer, or bouncing back when opening a rest day with no workout row
yet.
Good example: Always `showActions`; title-bar plus opens the sheet; empty body
is copy only.
