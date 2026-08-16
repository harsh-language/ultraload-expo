---
status: source-of-truth
last_updated: 2026-08-15
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

- Continues progression from the **last fixed session** (currently `2026-08-09`) using the rules above — never from a previous rolling-today day.
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

The compact schedule below is canonical. Each weight column is that exercise's
working weight. Expand each row in plan order:

- `single`: warm-up `10 @ ~50%`; standard `10 / 9 / 8 @ W`; then `8 @ W−5`.
- `double`: warm-up `10 @ ~50%`; standard `10 / 10 / 9 / 8 @ W`.

| date | bench kg | bench pattern | squat kg | squat pattern | lat kg | lat pattern |
|------|---------:|---------------|---------:|---------------|-------:|-------------|
| 2026-04-01 | 60 | single | 80 | single | 50 | single |
| 2026-04-08 | 60 | double | 80 | double | 50 | double |
| 2026-04-15 | 65 | single | 85 | single | 55 | single |
| 2026-04-22 | 65 | double | 85 | double | 55 | double |
| 2026-05-01 | 70 | single | 90 | single | 60 | single |
| 2026-05-08 | 70 | single | 90 | single | 60 | single |
| 2026-05-15 | 70 | double | 90 | double | 60 | double |
| 2026-05-22 | 75 | single | 95 | single | 65 | single |
| 2026-06-01 | 75 | single | 95 | single | 65 | single |
| 2026-06-08 | 75 | double | 95 | double | 65 | double |
| 2026-06-15 | 80 | single | 100 | single | 70 | single |
| 2026-06-22 | 80 | single | 100 | single | 70 | single |
| 2026-07-01 | 80 | single | 100 | single | 70 | single |
| 2026-07-03 | 80 | double | 100 | single | 70 | single |
| 2026-07-05 | 85 | single | 100 | double | 70 | double |
| 2026-07-07 | 85 | single | 105 | single | 75 | single |
| 2026-07-09 | 85 | single | 105 | single | 75 | single |
| 2026-07-11 | 85 | double | 105 | double | 75 | double |
| 2026-07-13 | 90 | single | 110 | single | 80 | single |
| 2026-07-15 | 90 | single | 110 | single | 80 | double |
| 2026-07-17 | 90 | double | 110 | single | 85 | single |
| 2026-07-20 | 95 | single | 110 | single | 85 | single |
| 2026-07-22 | 95 | single | 110 | double | 85 | single |
| 2026-07-24 | 95 | double | 115 | double | 85 | double |
| 2026-07-26 | 100 | single | 120 | single | 90 | single |
| 2026-07-28 | 100 | single | 120 | single | 90 | single |
| 2026-07-31 | 100 | double | 120 | double | 90 | double |
| 2026-08-02 | 105 | single | 125 | single | 95 | single |
| 2026-08-05 | 105 | double | 125 | double | 95 | double |
| 2026-08-09 | 110 | single | 130 | single | 100 | single |
