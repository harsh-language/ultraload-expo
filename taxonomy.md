---
last_updated: 2026-06-22
product: UltraLoad
status: current
---

# UltraLoad

## What this is

A personal, offline strength-training app for one experienced lifter. It logs ad-hoc gym sessions with almost no friction (a "notepad" — no start button; the first set of the day creates that day's record) and shows whether you're getting stronger over months by tracking **total weight moved** (weight × reps for non-warm-up sets). React Native (Expo), iOS + Android, 100% offline, dark mode only. No splits, no cloud, no App Store.

## Screens

| Screen | Why the user sees it |
|--------|----------------------|
| Splash | Branded loading moment on launch |
| Onboarding (4 steps) | Set bodyweight, pick plan exercises, rest preset, warm-up preset |
| Work Out (main) | Log and review today's sets, grouped by exercise |
| Add/Edit Set sheet | Pick exercise, set reps + weight via sliders, warm-up toggle |
| Rest timer | Optional countdown between sets (3 s–5 min) |
| History — list | Per-day total weight + % change over time |
| History — chart | Progress trends with exercise / muscle-group filters |
| Session detail | Review (and edit) a past day's sets |
| Settings | Bodyweight, plan, presets, units, export, reset |
| Add exercises | Add/remove exercises from the workout plan |

## Flows and actions

- **Onboarding:** splash → bodyweight → exercise picker → rest preset → warm-up preset → Work Out.
- **Log a set:** Add Set → bottom sheet → reps/weight sliders + warm-up toggle → Record.
- **Edit/delete:** same bottom sheet from Work Out or History; deletes confirm via overlay.
- **Review progress:** History list (daily totals + % change) and chart (filter by exercise or muscle group; month/year/all-time).
- **Manage plan:** Settings → add/remove exercises. Removing one shows a confirmation bottom sheet (history hidden until re-added; sets kept).
- **Export / reset:** export a JSON snapshot; reset wipes everything and replays onboarding.

## Key concepts

- **Standard vs warm-up sets:** only standard (non-warm-up) sets count toward progress. Sets at/under a threshold weight auto-tag as warm-up (can be turned off globally in Settings); the toggle can override one set. Tap a logged set row to edit.
- **Total weight moved:** Σ(weight × reps) per exercise per day; day total sums across exercises.
- **% change:** compares an exercise to its previous session; "—" when there's no valid comparison. Day % averages only exercises that have a comparison.
- **Muscle-group weighting:** each exercise contributes to one or more muscle groups by a multiplier — used only for the chart's muscle-group filter (Chest, Shoulders, Back, Glutes, Quads).
- **Built-in catalogue:** editable seed data in one backend file (not hardcoded in screens). Drives which exercises, sliders, toggles, and chart filters appear. v1 starts with 25 exercises; list and muscle multipliers will evolve with research. **Ids never change** — edit display names/ranges freely; retire exercises with `deprecated: true` instead of deleting rows. No in-app custom exercises.
- **Units & bodyweight:** stored in kg; displayed in kg/lbs/stone. The 3 bodyweight exercises (dip, weighted pull-ups, glute bridge curl) show **total weight** (bodyweight + added; added can be negative = assisted). Their slider range is **0.5×–2× current bodyweight** and their warm-up threshold is **total ≤ current bodyweight** — both recomputed **live** whenever bodyweight changes in Settings. Per-exercise range/warm-up overrides in Settings apply only to the other 22 exercises. The 75 kg strength-standard ranges apply only to those 22 exercises.

## Find in code

| Area | Where to look |
|------|---------------|
| Onboarding | _placeholder — fill after build_ |
| Work Out / set logging | _placeholder_ |
| Progress math (totals, % change, weighting) | _placeholder_ |
| Exercise catalogue + plan | `src/data/exercise-catalogue.ts` (or equivalent) |
| History list + chart | _placeholder_ |
| Settings + units | _placeholder_ |
| Export / import / reset | _placeholder_ |
| Data layer (SQLite/Drizzle) | _placeholder_ |

## Keeping this current

Not auto-updated. Stale? Ask agent: "Update taxonomy.md from the current project."
