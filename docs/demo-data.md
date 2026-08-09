---
status: source-of-truth
last_updated: 2026-08-08
---

# Demo data

Canonical placeholder workout history for UltraLoad.

Seed and reset must match this file exactly. Update this file before changing seed code.

## Instructions

- Weights in kg.
- All recorded weights are multiples of **5** (no decimals).
- On reset: wipe all workouts, then re-seed from this file (sessions + metadata) when the homepage **demo data** toggle is on. After reseed, only **Sessions** dates + rolling today remain — drop leftover prior rolling-today days (e.g. Aug 3 when today is Aug 8).
- Homepage options menu (`__DEV__` only): `demo data : on` / `demo data : off` — when off, seed is skipped and demo session days are removed. Hidden in release builds.
- Fixed history: do not seed dates outside the **Sessions** list below.
- Exercise order within a session: bench-press → low-bar-squats → lat-pulldown.
- Warm-up weight is ~50% of working weight, rounded to a multiple of 5.
- After a standard set of **8** reps, the next standard set for that exercise drops by **5 kg** and stays in the **8–9** rep range.
- Standard-set 10-rep count on the prior session, per exercise:
  - Next session **increases** working weight → prior has **exactly two** sets at 10 reps (10 / 10 / 9 / 8 at the same weight).
  - Next session **keeps** working weight → prior has **exactly one** set at 10 reps, then 9 / 8, then drop (10 @ W / 9 @ W / 8 @ W / 8 @ W−5).
  - Never more than two standard sets at 10 reps.

## Rolling today (DEV)

Not a fixed date in the Sessions table. Generated at seed time for the device-local calendar day.

- Continues progression from the **last fixed session** (currently `2026-07-31`) using the rules above — never from a previous rolling-today day.
- Date = `getLocalCalendarDate()` (today on this device). Yesterday’s rolling day is not promoted into fixed history.
- Inject **only** when today has **zero sets** (warm-ups count) **and** `_dev_prefs.today_demo_date` ≠ today.
- After inject, set `today_demo_date` to today (code-only tag; not shown in UI). No repair if the user clears or edits today — reseed only on **reset**.
- **Reset** also prunes any workout date that is not a Sessions date and not today, so an older rolling-today day whose pref tag was overwritten does not survive.
- Toggle off / `clearDemoWorkouts`: remove fixed demo dates **and** the workout for `today_demo_date` if set; clear the pref.

## Metadata

Applied on seed when the plan is empty or onboarding is incomplete (including after reset).

### Profile

| field | value |
|-------|------:|
| bodyweight | 75 |
| name | null |
| height | null |
| age | null |
| units | kg |
| warmUpPercent | 50 |
| warmUpAutoTagEnabled | true |
| restTimerSeconds | 180 |
| onboardingComplete | true |

### Plan

| order | exercise_id |
|------:|-------------|
| 1 | bench-press |
| 2 | low-bar-squats |
| 3 | lat-pulldown |

## Sessions

### 2026-07-01

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 40 | 10 |
| bench-press | false | 80 | 10 |
| bench-press | false | 80 | 9 |
| bench-press | false | 80 | 8 |
| bench-press | false | 75 | 8 |
| low-bar-squats | true | 50 | 10 |
| low-bar-squats | false | 100 | 10 |
| low-bar-squats | false | 100 | 9 |
| low-bar-squats | false | 100 | 8 |
| low-bar-squats | false | 95 | 8 |
| lat-pulldown | true | 35 | 10 |
| lat-pulldown | false | 70 | 10 |
| lat-pulldown | false | 70 | 9 |
| lat-pulldown | false | 70 | 8 |
| lat-pulldown | false | 65 | 8 |

### 2026-07-03

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 40 | 10 |
| bench-press | false | 80 | 10 |
| bench-press | false | 80 | 10 |
| bench-press | false | 80 | 9 |
| bench-press | false | 80 | 8 |
| low-bar-squats | true | 50 | 10 |
| low-bar-squats | false | 100 | 10 |
| low-bar-squats | false | 100 | 9 |
| low-bar-squats | false | 100 | 8 |
| low-bar-squats | false | 95 | 8 |
| lat-pulldown | true | 35 | 10 |
| lat-pulldown | false | 70 | 10 |
| lat-pulldown | false | 70 | 9 |
| lat-pulldown | false | 70 | 8 |
| lat-pulldown | false | 65 | 8 |

### 2026-07-05

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 40 | 10 |
| bench-press | false | 85 | 10 |
| bench-press | false | 85 | 9 |
| bench-press | false | 85 | 8 |
| bench-press | false | 80 | 8 |
| low-bar-squats | true | 50 | 10 |
| low-bar-squats | false | 100 | 10 |
| low-bar-squats | false | 100 | 10 |
| low-bar-squats | false | 100 | 9 |
| low-bar-squats | false | 100 | 8 |
| lat-pulldown | true | 35 | 10 |
| lat-pulldown | false | 70 | 10 |
| lat-pulldown | false | 70 | 10 |
| lat-pulldown | false | 70 | 9 |
| lat-pulldown | false | 70 | 8 |

### 2026-07-07

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 40 | 10 |
| bench-press | false | 85 | 10 |
| bench-press | false | 85 | 9 |
| bench-press | false | 85 | 8 |
| bench-press | false | 80 | 8 |
| low-bar-squats | true | 50 | 10 |
| low-bar-squats | false | 105 | 10 |
| low-bar-squats | false | 105 | 9 |
| low-bar-squats | false | 105 | 8 |
| low-bar-squats | false | 100 | 8 |
| lat-pulldown | true | 35 | 10 |
| lat-pulldown | false | 75 | 10 |
| lat-pulldown | false | 75 | 9 |
| lat-pulldown | false | 75 | 8 |
| lat-pulldown | false | 70 | 8 |

### 2026-07-09

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 40 | 10 |
| bench-press | false | 85 | 10 |
| bench-press | false | 85 | 9 |
| bench-press | false | 85 | 8 |
| bench-press | false | 80 | 8 |
| low-bar-squats | true | 50 | 10 |
| low-bar-squats | false | 105 | 10 |
| low-bar-squats | false | 105 | 9 |
| low-bar-squats | false | 105 | 8 |
| low-bar-squats | false | 100 | 8 |
| lat-pulldown | true | 35 | 10 |
| lat-pulldown | false | 75 | 10 |
| lat-pulldown | false | 75 | 9 |
| lat-pulldown | false | 75 | 8 |
| lat-pulldown | false | 70 | 8 |

### 2026-07-11

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 40 | 10 |
| bench-press | false | 85 | 10 |
| bench-press | false | 85 | 10 |
| bench-press | false | 85 | 9 |
| bench-press | false | 85 | 8 |
| low-bar-squats | true | 50 | 10 |
| low-bar-squats | false | 105 | 10 |
| low-bar-squats | false | 105 | 10 |
| low-bar-squats | false | 105 | 9 |
| low-bar-squats | false | 105 | 8 |
| lat-pulldown | true | 35 | 10 |
| lat-pulldown | false | 75 | 10 |
| lat-pulldown | false | 75 | 10 |
| lat-pulldown | false | 75 | 9 |
| lat-pulldown | false | 75 | 8 |

### 2026-07-13

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 45 | 10 |
| bench-press | false | 90 | 10 |
| bench-press | false | 90 | 9 |
| bench-press | false | 90 | 8 |
| bench-press | false | 85 | 8 |
| low-bar-squats | true | 55 | 10 |
| low-bar-squats | false | 110 | 10 |
| low-bar-squats | false | 110 | 9 |
| low-bar-squats | false | 110 | 8 |
| low-bar-squats | false | 105 | 8 |
| lat-pulldown | true | 40 | 10 |
| lat-pulldown | false | 80 | 10 |
| lat-pulldown | false | 80 | 9 |
| lat-pulldown | false | 80 | 8 |
| lat-pulldown | false | 75 | 8 |

### 2026-07-15

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 45 | 10 |
| bench-press | false | 90 | 10 |
| bench-press | false | 90 | 9 |
| bench-press | false | 90 | 8 |
| bench-press | false | 85 | 8 |
| low-bar-squats | true | 55 | 10 |
| low-bar-squats | false | 110 | 10 |
| low-bar-squats | false | 110 | 9 |
| low-bar-squats | false | 110 | 8 |
| low-bar-squats | false | 105 | 8 |
| lat-pulldown | true | 40 | 10 |
| lat-pulldown | false | 80 | 10 |
| lat-pulldown | false | 80 | 10 |
| lat-pulldown | false | 80 | 9 |
| lat-pulldown | false | 80 | 8 |

### 2026-07-17

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 45 | 10 |
| bench-press | false | 90 | 10 |
| bench-press | false | 90 | 10 |
| bench-press | false | 90 | 9 |
| bench-press | false | 90 | 8 |
| low-bar-squats | true | 55 | 10 |
| low-bar-squats | false | 110 | 10 |
| low-bar-squats | false | 110 | 9 |
| low-bar-squats | false | 110 | 8 |
| low-bar-squats | false | 105 | 8 |
| lat-pulldown | true | 40 | 10 |
| lat-pulldown | false | 85 | 10 |
| lat-pulldown | false | 85 | 9 |
| lat-pulldown | false | 85 | 8 |
| lat-pulldown | false | 80 | 8 |

### 2026-07-20

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 45 | 10 |
| bench-press | false | 95 | 10 |
| bench-press | false | 95 | 9 |
| bench-press | false | 95 | 8 |
| bench-press | false | 90 | 8 |
| low-bar-squats | true | 55 | 10 |
| low-bar-squats | false | 110 | 10 |
| low-bar-squats | false | 110 | 9 |
| low-bar-squats | false | 110 | 8 |
| low-bar-squats | false | 105 | 8 |
| lat-pulldown | true | 40 | 10 |
| lat-pulldown | false | 85 | 10 |
| lat-pulldown | false | 85 | 9 |
| lat-pulldown | false | 85 | 8 |
| lat-pulldown | false | 80 | 8 |

### 2026-07-22

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 45 | 10 |
| bench-press | false | 95 | 10 |
| bench-press | false | 95 | 9 |
| bench-press | false | 95 | 8 |
| bench-press | false | 90 | 8 |
| low-bar-squats | true | 55 | 10 |
| low-bar-squats | false | 110 | 10 |
| low-bar-squats | false | 110 | 10 |
| low-bar-squats | false | 110 | 9 |
| low-bar-squats | false | 110 | 8 |
| lat-pulldown | true | 40 | 10 |
| lat-pulldown | false | 85 | 10 |
| lat-pulldown | false | 85 | 9 |
| lat-pulldown | false | 85 | 8 |
| lat-pulldown | false | 80 | 8 |

### 2026-07-24

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 45 | 10 |
| bench-press | false | 95 | 10 |
| bench-press | false | 95 | 10 |
| bench-press | false | 95 | 9 |
| bench-press | false | 95 | 8 |
| low-bar-squats | true | 55 | 10 |
| low-bar-squats | false | 115 | 10 |
| low-bar-squats | false | 115 | 10 |
| low-bar-squats | false | 115 | 9 |
| low-bar-squats | false | 115 | 8 |
| lat-pulldown | true | 40 | 10 |
| lat-pulldown | false | 85 | 10 |
| lat-pulldown | false | 85 | 10 |
| lat-pulldown | false | 85 | 9 |
| lat-pulldown | false | 85 | 8 |

### 2026-07-26

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 50 | 10 |
| bench-press | false | 100 | 10 |
| bench-press | false | 100 | 9 |
| bench-press | false | 100 | 8 |
| bench-press | false | 95 | 8 |
| low-bar-squats | true | 60 | 10 |
| low-bar-squats | false | 120 | 10 |
| low-bar-squats | false | 120 | 9 |
| low-bar-squats | false | 120 | 8 |
| low-bar-squats | false | 115 | 8 |
| lat-pulldown | true | 45 | 10 |
| lat-pulldown | false | 90 | 10 |
| lat-pulldown | false | 90 | 9 |
| lat-pulldown | false | 90 | 8 |
| lat-pulldown | false | 85 | 8 |

### 2026-07-28

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 50 | 10 |
| bench-press | false | 100 | 10 |
| bench-press | false | 100 | 9 |
| bench-press | false | 100 | 8 |
| bench-press | false | 95 | 8 |
| low-bar-squats | true | 60 | 10 |
| low-bar-squats | false | 120 | 10 |
| low-bar-squats | false | 120 | 9 |
| low-bar-squats | false | 120 | 8 |
| low-bar-squats | false | 115 | 8 |
| lat-pulldown | true | 45 | 10 |
| lat-pulldown | false | 90 | 10 |
| lat-pulldown | false | 90 | 9 |
| lat-pulldown | false | 90 | 8 |
| lat-pulldown | false | 85 | 8 |

### 2026-07-31

| exercise_id | warmUp | weight_kg | reps |
|-------------|--------|----------:|-----:|
| bench-press | true | 50 | 10 |
| bench-press | false | 100 | 10 |
| bench-press | false | 100 | 10 |
| bench-press | false | 100 | 9 |
| bench-press | false | 100 | 8 |
| low-bar-squats | true | 60 | 10 |
| low-bar-squats | false | 120 | 10 |
| low-bar-squats | false | 120 | 10 |
| low-bar-squats | false | 120 | 9 |
| low-bar-squats | false | 120 | 8 |
| lat-pulldown | true | 45 | 10 |
| lat-pulldown | false | 90 | 10 |
| lat-pulldown | false | 90 | 10 |
| lat-pulldown | false | 90 | 9 |
| lat-pulldown | false | 90 | 8 |
