---
last_updated: 2026-07-28
product: UltraLoad
status: current
---

# UltraLoad

## What this is

A personal, offline strength-training app for one experienced lifter. It logs ad-hoc gym sessions with almost no friction (a "notepad" — no start button; the first set of the day creates that day's record) and shows whether you're getting stronger over months by tracking **total weight moved** (weight × reps for non-warm-up sets). React Native (Expo 56), iOS + Android, 100% offline, dark mode only. No splits, no cloud, no App Store.

## Build status (v1 in progress)

| Area | Status |
|------|--------|
| App shell, splash, onboarding | **Built** |
| Work Out — log today's sets | **Built** (add, edit, delete, warm-up auto-tag) |
| Options menu (history, settings, demo data, reset) | **Built** (History + Settings for everyone; **demo-data toggle + reset are `__DEV__` only** — visible on simulator for personal testing, hidden in release / U7) |
| Rest timer | **Built** (foreground countdown, pause/resume, dismiss, background notification) |
| History (list, chart, session detail) | **Partial** — list + session detail built (U4); chart is a stub until U5 |
| Settings | **Built** (profile, plan editing, presets, units) |
| Export/import/reset | **Not built** (U6; dev reset remains in the options menu) |
| Progress math (% change, chart weighting) | **Partial** — day totals + % change built (U4); muscle-group weighting is U5 |
| Unit tests (domain, screens, components) | **Built** — Jest via `npm test` |

## Screens

| Screen | Why the user sees it | Status |
|--------|----------------------|--------|
| Splash | Branded loading moment on launch | Built — `SplashScreen` (~1.4 s) |
| Onboarding step 1 — profile | Bodyweight (required), optional name / age / height | Built — `BodyweightStep` (height collected in UI but not persisted yet) |
| Onboarding step 2 — exercises | Pick plan exercises from catalogue | Built — `ExercisePickerStep` + `ExercisePicker` (scrollable list, edge fades, selection ticker) |
| Onboarding step 3 — rest | Default rest-timer duration | Built — `RestTimerStep` |
| Onboarding step 4 — warm-up | Warm-up % preset + auto-tag toggle | Built — `WarmUpStep` (accordion “how it works”) |
| Work Out (home) | Log, edit, and delete today's sets, grouped by exercise | Built — `WorkOutScreen` |
| Add/Edit Set sheet | Pick exercise, set reps + weight via sliders, warm-up toggle | Built — `AddSetSheet` |
| Delete Set sheet | Confirm deletion with a preview of the selected set | Built — `DeleteSetSheet` |
| Rest timer | Optional countdown between sets | Built — `RestTimer` |
| History — list | Per-day total weight + % change over time | Built — `HistoryListScreen` |
| History — chart | Progress trends with exercise / muscle-group filters | Stub — `HistoryChartScreen` (U5) |
| Session detail | Review (and edit) a past day's sets | Built — `SessionDetailScreen` |
| Settings | Profile, plan, presets, units | Built — `SettingsScreen` |
| Add exercises | Add/remove exercises from the workout plan | Built — `AddExercisesScreen` (instant toggle; plan hide only, past sets kept) |

## Flows and actions

- **Cold start:** `DatabaseProvider` migrates SQLite → hydrates Zustand stores → splash (~1.4 s) → onboarding (if incomplete) or **Work Out home**.
- **Onboarding:** horizontal pager (`OnboardingPager`) — profile → exercise picker → rest preset → warm-up preset → saves profile + plan → Work Out home. Steps 1, 3, 4 use `OnboardingLayout` (stacked footer); step 2 uses overlay footer + scroll.
- **Exercise picker:** muscle-group sections, multi-select options, floating “N selected” ticker (`ExerciseSelectionTicker`), scroll edge fades (`ScrollFadeView` with per-edge height overrides).
- **Log a set:** Work Out → Add new set → `AddSetSheet` → exercise dropdown + reps/weight sliders + warm-up toggle → Record → persists to today's workout row (creates workout on first set of the day).
- **Review today:** Work Out scroll list — exercise headers + set rows (`LogRow`); warm-up sets show `W`, standard sets numbered. Edge fades on the log list.
- **Navigate elsewhere:** session title bar chevron → options menu (`OptionsMenuDropdown`) — Settings and History open stack screens; History chart is a stub until U5; in `__DEV__` only, demo-data toggle seeds or clears placeholder history and reset wipes data / replays onboarding.
- **Edit/delete sets:** tap a logged row to edit; delete opens a confirmation sheet.
- **Rest timer:** Work Out supports start, pause/resume, dismiss, and a background notification.
- **Manage settings:** edit profile, warm-up/rest presets, display units, and plan exercises; changes write through to SQLite. Per-exercise override UI is not in this version (catalogue per-exercise data still used for sliders).
- **Review progress / export:** History list + session detail are U4; chart is U5; export/import/reset are U6.

## Key concepts

- **Standard vs warm-up sets:** only standard (non-warm-up) sets count toward progress. Auto-tag when weight ≤ `warmUpPercent` × reference weight from logged history (BR15). Warm-up sets are never used when finding the reference. Manual toggle can override one set.
- **Total weight moved:** Σ(weight × reps) per exercise per day; Work Out shows today's total. History comparisons are not built yet.
- **% change:** compares an exercise to its previous session with standard sets; day % is a simple average of exercises with a valid comparison (BR8–BR11).
- **Muscle-group weighting:** each exercise contributes to one or more muscle groups by a multiplier — used for the future chart filter (`getFilterableMuscleGroups` in `domain/catalogue.ts`).
- **Built-in catalogue:** seed data in `src/data/exercise-catalogue.ts`. Drives exercises, sliders, toggles, and future chart filters. v1 has 22 exercises. **Ids never change** — edit display names/ranges freely; retire with `deprecated: true`. No in-app custom exercises.
- **Units & bodyweight:** weights stay in kg in SQLite and display as kg, lbs, or stone (rounded to 0.5). Profile bodyweight is a personal field. Exercises use fixed catalogue ranges (overridable in Settings).

## Find in code

| Area | Where to look |
|------|---------------|
| App entry | `App.tsx` — fonts, providers, status bar + navigation bar |
| Navigation & phases | `src/navigation/RootNavigator.tsx`, `src/navigation/types.ts` |
| Options menu | `src/components/OptionsMenuDropdown.tsx`, `useHomepageOptionsMenu.tsx` |
| Session title bar | `SessionTitleBar.tsx`, `TodaySessionTitleBar.tsx` |
| Splash | `src/screens/SplashScreen.tsx` |
| Onboarding flow | `src/screens/onboarding/OnboardingFlow.tsx`, `onboardingSteps.ts` |
| Onboarding pager | `src/screens/onboarding/OnboardingPager.tsx` |
| Onboarding layout shell | `src/screens/onboarding/OnboardingLayout.tsx` — shared chrome, scrollable mode, footer insets |
| Onboarding steps | `BodyweightStep`, `ExercisePickerStep`, `RestTimerStep`, `WarmUpStep` |
| Exercise picker list | `src/screens/onboarding/ExercisePicker.tsx` |
| Work Out | `src/screens/WorkOutScreen.tsx` |
| Settings and plan editing | `src/screens/SettingsScreen.tsx`, `AddExercisesScreen.tsx` |
| History list / chart stub / session detail | `HistoryListScreen.tsx`, `HistoryChartScreen.tsx`, `SessionDetailScreen.tsx` |
| History chrome | `HistoryNavigation.tsx`, `HistoryEmptyState.tsx` |
| Progress math (totals, % change) | `src/domain/progress.ts` — muscle-group weighting is U5 |
| Add Set sheet | `src/components/AddSetSheet.tsx` |
| Log list UI | `LogRow.tsx`, `ScrollFadeView.tsx` |
| Onboarding inputs | `InputComboUnit`, `InputHeightField`, `InputOption`, `InputSlider`, `InputSliderCaption`, `InputToggle`, `Accordion`, `SectionDivider` |
| Buttons & sheets | `PrimaryButton`, `SecondaryButton`, `IconButton`, `AppBottomSheet` |
| Exercise picker chrome | `ExerciseSelectionTicker`, `OnboardingProgress`, `ExerciseDropdown` |
| Icons (Central Icons wrappers) | `src/components/icons/` — add one file per icon as needed |
| Exercise catalogue + plan | `src/data/exercise-catalogue.ts`, `src/domain/catalogue.ts`, `src/stores/planSlice.ts` |
| Warm-up, slider ranges | `src/domain/warmup.ts`, `src/domain/ranges.ts` |
| Weight units | `src/domain/units.ts` |
| Profile validation | `src/domain/profile-inputs.ts`, `src/domain/height-input.ts` |
| Exercise picker layout math | `src/domain/exercise-selection-ticker.ts` |
| Calendar day key | `src/domain/day-record.ts` |
| Today's workout state | `src/stores/todaySlice.ts`, `src/db/workoutRepository.ts` |
| History workout state | `src/stores/historySlice.ts` — `listWorkoutTrees` + past-day mutate |
| Profile / plan persistence | `src/stores/profileSlice.ts`, `src/db/repositories.ts` |
| Dev app reset | `src/stores/devAppResetSlice.ts` |
| Rest timer state | `src/stores/timerSlice.ts` |
| SQLite schema | `src/db/schema.ts` — `profile`, `workout_plan`, `settings`, `workouts`, `logged_exercises`, `sets` |
| DB boot + migrations | `src/db/DatabaseProvider.tsx`, `src/db/migrations/` |
| Design tokens (from Figma) | `src/theme/tokens.ts` — regenerate via `figma_export_tokens` |
| Transparent colors in SVG | `src/theme/resolveColorToken.ts` |
| Typography & text casing | `src/theme/typography.ts`, `src/theme/textCase.ts` |
| Scroll edge fades | `src/theme/scrollFade.ts`, `ScrollFadeView.tsx` — `fadeHeight` (default), `topFadeHeight`, `bottomFadeHeight`, `topOffset`, `bottomOffset` |
| Unit tests | `__tests__/` — domain (incl. progress), scroll-fade, exercise-picker layout, onboarding insets |
| Export / import | _not built_ |

## Keeping this current

Not auto-updated. Stale? Ask agent: "Update taxonomy.md from the current project."
