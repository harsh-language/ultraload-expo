# Coverage Gaps

Use this file for missing standards, contradictions, stale docs, and open
questions. Do not silently upgrade a candidate here into an accepted rule.

## Contradictions

### workout-bottom-fade-offset-vs-page-align

Status: open
Type: contradiction
Source: `docs/product-design/references/interface-quality.md`
(`rule/chrome-stays-pinned-scroll-underneath`), `src/screens/WorkOutScreen.tsx`,
Figma `2749:8352`

Observation:
- Earlier proposed page-edge alignment (`topOffset`/`bottomOffset` 0) conflicted
  with Figma `# design`, which clears status bar + home indicator only.
- Shipped Work Out now uses safe-area insets; proposed
  `rule/workout-fades-clear-system-ui` replaces the old page-edge proposal.

Why it matters:
- Edge-aligned top fades paint under the status bar and make height experiments
  hard to see.

Follow-up:
- Accept `rule/workout-fades-clear-system-ui` and drop the obsolete page-edge wording.

## Missing standards

### history-and-settings-surfaces-not-yet-extracted

Status: resolved (filters); open (bottom nav / standards extraction)
Type: missing-standard
Source: `docs/blueprint.md`, `src/screens/HistoryListScreen.tsx`

Observation:
- History list + session detail + chart are implemented (U4–U5).
- **U5 decision (2026-08-12, revised 2026-08-16):** shared filter bar applies
  to **both** list and chart. Duration + muscle are the default controls;
  exercise appears after muscle selection and is limited to direct
  (`primaryMuscle`) matches. A title-bar icon toggles the two views (no tab
  labels). Duration dropdown is navigable
  (any past month/year + all-time). Bottom `main-navigation` remains excluded
  (stack nav wins, same as U4).
- Proposed History rules in `references/surfaces.md` and `resilience.md` still
  await acceptance after device checkpoint.

Why it matters:
- Filter behavior is now settled in blueprint FL7/F8; remaining gap is accepting
  proposed surface/resilience rules.

Follow-up:
- Accept or revise proposed History rules after device checkpoint.
- Bottom-tab Figma chrome stays out of v1.

### rest-timer-finish-behavior-beyond-current-bar

Status: open
Type: missing-standard
Source: `src/components/RestTimer.tsx`, `src/hooks/useRestTimer.ts`, `docs/blueprint.md`

Observation:
- The current timer bar covers running, stop, dismiss, and background
  notification behavior.
- The skill does not yet have accepted guidance for timer completion language,
  repeated-use patterns, or future history/session-detail reuse.

Why it matters:
- Timer UX is still new enough that one implementation should not be promoted
  into a broad standard without more evidence.

Follow-up:
- Revisit after additional timer-related commits or a second timer surface.

## Candidate learn-mode checks

### repeated-one-off-vs-general-rule

Status: open
Type: process-gap
Source: `docs/agentic-product-design.md`

Observation:
- The repo now has a learn mode, but the threshold for "repeated enough to
  accept" is still human judgment rather than an explicit numeric rule.

Why it matters:
- This is correct for now, but future learn passes should keep flagging whether
  a candidate comes from a single file, one commit cluster, or repeated cross-
  surface evidence.

Follow-up:
- Keep new learn-mode additions `status: proposed` until confirmed by a human.
