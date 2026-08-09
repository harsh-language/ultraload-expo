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

Status: open
Type: missing-standard
Source: `docs/blueprint.md`, `src/screens/HistoryListScreen.tsx`

Observation:
- History list + session detail are now implemented (U4); chart remains a stub.
- Proposed History rules are in `references/surfaces.md` and `resilience.md`
  awaiting acceptance.
- Figma History chrome includes muscle/exercise filters and a bottom main-
  navigation bar; U4 ships stack navigation + List/Chart tabs only (filters and
  bottom tabs deferred / codebase-nav wins).

Why it matters:
- Filter and bottom-nav decisions need explicit product confirmation before
  matching Figma 1:1.

Follow-up:
- Accept or revise proposed History rules after device checkpoint.
- U5 should decide whether list filters activate with the chart.

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
