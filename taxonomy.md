---
last_updated: 2026-06-25
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
| Work Out — log today's sets | **Built** (add set only; no edit/delete yet) |
| Rest timer | **Stub** (store + button; countdown UI not wired) |
| History (list, chart, session detail) | **Not built** (tab placeholder) |
| Settings, export/import, reset | **Not built** (tab placeholder) |
| Progress math (% change, chart weighting) | **Not built** (schema + domain helpers only) |
| Unit tests (domain, screens, components) | **Built** — Jest via `npm test` |

## Screens

| Screen | Why the user sees it | Status |
|--------|----------------------|--------|
| Splash | Branded loading moment on launch | Built — `SplashScreen` (~1.4 s) |
| Onboarding step 1 — profile | Bodyweight (required), optional name / age / height | Built — `BodyweightStep` (height collected in UI but not persisted yet) |
| Onboarding step 2 — exercises | Pick plan exercises from catalogue | Built — `ExercisePickerStep` + `ExercisePicker` (scrollable list, edge fades, selection ticker) |
| Onboarding step 3 — rest | Default rest-timer duration | Built — `RestTimerStep` |
| Onboarding step 4 — warm-up | Warm-up % preset + auto-tag toggle | Built — `WarmUpStep` (accordion “how it works”) |
| Work Out (main) | Log and review today's sets, grouped by exercise | Built — `WorkOutScreen` |
| Add Set sheet | Pick exercise, set reps + weight via sliders, warm-up toggle | Built — `AddSetSheet` |
| Rest timer | Optional countdown between sets | Not built (button present, no UI) |
| History — list | Per-day total weight + % change over time | Not built |
| History — chart | Progress trends with exercise / muscle-group filters | Not built |
| Session detail | Review (and edit) a past day's sets | Not built |
| Settings | Bodyweight, plan, presets, units, export, reset | Not built |
| Add exercises | Add/remove exercises from the workout plan | Onboarding only (Settings flow not built) |

## Flows and actions

- **Cold start:** `DatabaseProvider` migrates SQLite → hydrates Zustand stores → splash (~1.4 s) → onboarding (if incomplete) or main tabs.
- **Onboarding:** horizontal pager (`OnboardingPager`) — profile → exercise picker → rest preset → warm-up preset → saves profile + plan → Work Out tab. Steps 1, 3, 4 use `OnboardingLayout` (stacked footer); step 2 uses overlay footer + scroll.
- **Exercise picker:** muscle-group sections, multi-select options, floating “N selected” ticker (`ExerciseSelectionTicker`), scroll edge fades (`ScrollFadeView` with per-edge height overrides).
- **Log a set:** Work Out → Add new set → `AddSetSheet` → exercise dropdown + reps/weight sliders + warm-up toggle → Record → persists to today's workout row (creates workout on first set of the day).
- **Review today:** Work Out scroll list — exercise headers + set rows (`LogRow`); warm-up sets show `W`, standard sets numbered. Edge fades on the log list.
- **Main tabs:** horizontal pager (`MainTabPager`) — history | workout | settings; only Work Out is functional.
- **Edit/delete sets:** planned — `LogRow` supports action icons but Work Out does not wire them yet.
- **Rest timer:** planned — `useTimerStore` exists; Work Out footer button is a stub.
- **Review progress / manage plan / export / reset:** planned — History and Settings tabs show `TabPlaceholderScreen`.

## Key concepts

- **Standard vs warm-up sets:** only standard (non-warm-up) sets count toward progress. Sets at/under a threshold weight auto-tag as warm-up when global auto-tag is on (`domain/warmup.ts`); the toggle can override one set. Tap-to-edit on logged rows is not wired yet.
- **Total weight moved:** Σ(weight × reps) per exercise per day; day total sums across exercises — **math not implemented in UI yet**.
- **% change:** compares an exercise to its previous session — **not implemented yet**.
- **Muscle-group weighting:** each exercise contributes to one or more muscle groups by a multiplier — used for the future chart filter (`getFilterableMuscleGroups` in `domain/catalogue.ts`).
- **Built-in catalogue:** seed data in `src/data/exercise-catalogue.ts`. Drives exercises, sliders, toggles, and future chart filters. v1 has 25 exercises. **Ids never change** — edit display names/ranges freely; retire with `deprecated: true`. No in-app custom exercises.
- **Units & bodyweight:** stored in kg in SQLite; display units (`kg` / `lbs` / `stone`) on profile schema — **unit conversion UI not built**. The 3 bodyweight exercises use **total weight** (bodyweight + added). Their slider range is **0.5×–2× current bodyweight** and warm-up threshold is **total ≤ bodyweight** (`domain/ranges.ts`, `domain/warmup.ts`). Per-exercise overrides live in `settings` table — **Settings UI not built**.

## Find in code

| Area | Where to look |
|------|---------------|
| App entry | `App.tsx` — fonts, providers |
| Navigation & phases | `src/navigation/RootNavigator.tsx` (splash / onboarding / main) |
| Tab pager | `src/navigation/MainTabPager.tsx`, `src/navigation/mainTabs.ts` |
| Bottom nav | `src/components/MainNavigation.tsx`, `NavigationTab.tsx` |
| Splash | `src/screens/SplashScreen.tsx` |
| Onboarding flow | `src/screens/onboarding/OnboardingFlow.tsx`, `onboardingSteps.ts` |
| Onboarding pager | `src/screens/onboarding/OnboardingPager.tsx` |
| Onboarding layout shell | `src/screens/onboarding/OnboardingLayout.tsx` — shared chrome, scrollable mode, footer insets |
| Onboarding steps | `BodyweightStep`, `ExercisePickerStep`, `RestTimerStep`, `WarmUpStep` |
| Exercise picker list | `src/screens/onboarding/ExercisePicker.tsx` |
| Work Out | `src/screens/WorkOutScreen.tsx` |
| Add Set sheet | `src/components/AddSetSheet.tsx` |
| Log list UI | `LogRow.tsx`, `ScrollFadeView.tsx`, `TodaySessionTitleBar.tsx` |
| Onboarding inputs | `InputComboUnit`, `InputHeightField`, `InputOption`, `InputSlider`, `InputSliderCaption`, `InputToggle`, `Accordion`, `SectionDivider` |
| Buttons & sheets | `PrimaryButton`, `SecondaryButton`, `IconButton`, `AppBottomSheet` |
| Exercise picker chrome | `ExerciseSelectionTicker`, `OnboardingProgress`, `ExerciseDropdown` |
| Icons (Central Icons wrappers) | `src/components/icons/` — add one file per icon as needed |
| Exercise catalogue + plan | `src/data/exercise-catalogue.ts`, `src/domain/catalogue.ts`, `src/stores/planSlice.ts` |
| Warm-up + slider ranges | `src/domain/warmup.ts`, `src/domain/ranges.ts` |
| Profile validation | `src/domain/profile-inputs.ts`, `src/domain/height-input.ts` |
| Exercise picker layout math | `src/domain/exercise-selection-ticker.ts` |
| Calendar day key | `src/domain/day-record.ts` |
| Today's workout state | `src/stores/todaySlice.ts`, `src/db/workoutRepository.ts` |
| Profile / settings / plan persistence | `src/stores/profileSlice.ts`, `settingsSlice.ts`, `src/db/repositories.ts` |
| Rest timer state (stub) | `src/stores/timerSlice.ts` |
| SQLite schema | `src/db/schema.ts` — `profile`, `workout_plan`, `settings`, `workouts`, `logged_exercises`, `sets` |
| DB boot + migrations | `src/db/DatabaseProvider.tsx`, `src/db/migrations/` |
| Design tokens (from Figma) | `src/theme/tokens.ts` — regenerate via `figma_export_tokens` |
| Transparent colors in SVG | `src/theme/resolveColorToken.ts` |
| Typography & text casing | `src/theme/typography.ts`, `src/theme/textCase.ts` |
| Scroll edge fades | `src/theme/scrollFade.ts`, `ScrollFadeView.tsx` — `fadeHeight` (default), `topFadeHeight`, `bottomFadeHeight`, `topOffset`, `bottomOffset` |
| History / Settings (placeholders) | `src/screens/TabPlaceholderScreen.tsx` |
| Dev smoke test (not wired) | `src/screens/PlaceholderTabs.tsx` |
| Unit tests | `__tests__/` — domain, scroll-fade, exercise-picker layout, onboarding insets |
| Progress math (totals, % change, weighting) | _not built_ — see `docs/application-blueprint/blueprint.md` |
| Export / import / reset | _not built_ |

## Keeping this current

Not auto-updated. Stale? Ask agent: "Update taxonomy.md from the current project."
