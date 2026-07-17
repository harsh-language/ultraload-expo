# Exemplar: Work Out empty vs logged

Status: accepted evidence
Primary surface: `src/screens/WorkOutScreen.tsx`
Supporting sources: `src/components/TodaySessionTitleBar.tsx`, `src/domain/session-totals.ts`
Commits: `062124f`, `5492bf7`

## Decision this exemplar supports

- `rule/workout-home-reorganizes-around-log-state`
- `rule/empty-vs-logged-layout-follows-job`
- `rule/chrome-stays-pinned-scroll-underneath`
- `rule/show-session-total-only-when-standard-work-exists`
- `rule/rest-timer-stays-optional-and-separate-from-recording`

## Good

- Empty day: centered stacked actions keep the next move obvious.
- Logged day: `ScrollFadeView` becomes the main surface and pinned chrome stays
  outside the scroller.
- Timer-visible state: the add-set CTA lifts above the timer bar rather than
  competing with it.
- Session total appears only when standard sets exist.
- Menu, title bar, footer, and timer each stay lightweight and local to the
  main logging surface.

## Bad to avoid

- Introducing a `start workout` hero or setup step before the first set.
- Keeping the empty-state stack after the user has started logging.
- Letting the title bar or footer scroll away with the log.
- Showing fake progress totals for warm-up-only sessions.
- Auto-starting the rest timer when a set is recorded.

## Why this matters

The Work Out screen is the product's main composition. It demonstrates how
layout changes with session state while preserving a single clear job: log and
review today's work with minimal friction.
