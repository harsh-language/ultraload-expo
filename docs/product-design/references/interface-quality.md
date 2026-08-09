# Interface Quality

Load for material visual changes, UI reviews, and implementation work that
 changes hierarchy, layout, or surface composition.

Route visual mechanics to existing owners:

- `.cursor/rules/design-fills.mdc`
- `.cursor/rules/component-layering.mdc`
- `.cursor/rules/scroll-fade.mdc`
- `.cursor/rules/button-content-alignment.mdc`
- `.cursor/rules/panel-motion.mdc`
- `.cursor/rules/figma-design-tokens.mdc`

## rule/reuse-existing-shell-before-inventing
Status: accepted
Scope: sheets, overlays, and screen composition
Rule: Reuse the app's existing shells before creating a parallel surface.
Set-logging sheets use `AppBottomSheet`; vertically scrolling fixed viewports
use `ScrollFadeView`; CTA rows use existing `PrimaryButton` and
`SecondaryButton` patterns.
Why: The repo already has accepted shells for the built surfaces. Reusing them
keeps interaction and pacing consistent while the product is still narrow.
Exceptions: None documented in current code. Any exception requires a real
surface need, not a one-screen styling preference.
Source: `.cursor/rules/design-fills.mdc`, global skill `harsh-product-design` Build mechanics, `src/components/AppBottomSheet.tsx`, `src/screens/WorkOutScreen.tsx`
Bad example: A one-off set editor that bypasses `AppBottomSheet` or hand-builds
its own title, footer, and motion.
Good example: `AddSetSheet` and `DeleteSetSheet` both compose on top of
`AppBottomSheet`.

## rule/chrome-stays-pinned-scroll-underneath
Status: accepted
Scope: Work Out and other fixed-viewport scrolling surfaces
Rule: Keep title bars, pinned footers, and timer bars outside the scrolling
viewport. Scroll content underneath them and offset fades so the chrome stays
legible.
Why: The Work Out surface is built around persistent controls and context. The
user should not lose the add-set path or title state while reviewing the log.
Exceptions: None documented for the current built surfaces.
Source: `.cursor/rules/scroll-fade.mdc`, `src/screens/WorkOutScreen.tsx`
Bad example: Putting the title bar or footer inside the scroll container so it
fades or scrolls away with the log.
Good example: `WorkOutScreen` renders title/footer overlays outside
`ScrollFadeView`; fades use safe-area offsets only — see proposed
`rule/workout-fades-clear-system-ui`.

## rule/workout-fades-clear-system-ui
Status: proposed
Scope: Work Out logged state
Rule: Scroll fades clear system UI only — `topOffset={insets.top}`,
`bottomOffset={insets.bottom}`. Top height `s-17`, bottom `s-16`
(`SCROLL_FADE_HEIGHT`). Do not pin fades to the session title or footer
buttons, and do not start them at the absolute screen edge (`offset` 0).
Why: Figma `# design` (`2749:8352`) places `top-fade` below the status bar and
`bottom-fade` above the home indicator. Edge-aligned fades paint under system
chrome; button-aligned fades band across CTAs.
Exceptions: Other screens may still offset for app chrome when that surface
requires it. Opaque title chrome (`ScreenTitleBar`) may use
`topFadeEnabled={false}` instead.
Source: Figma `2749:8352`, `src/screens/WorkOutScreen.tsx`,
`.cursor/rules/scroll-fade.mdc`
Bad example: `topOffset={0}`, or `bottomOffset={FOOTER_BOTTOM_GAP + PINNED_FOOTER_HEIGHT}`.
Good example: safe-area insets only; Figma heights `s-17` / `s-16`.

## rule/last-log-row-omits-bottom-border
Status: proposed
Scope: `LogRow` set and session lists (Work Out, session detail, History list)
Rule: Bottom borders separate sibling rows. The last row in a group omits the
bottom border — last set per exercise, and last History session row. Call sites
pass `showBottomBorder={false}`; default remains bordered.
Why: A trailing border under the last item is decoration without a separation
job.
Exceptions: Delete-set preview keeps its own top+bottom border chrome (not a
list). Title bars and dropdown menus are unrelated surfaces.
Source: `src/components/LogRow.tsx`, `src/screens/WorkOutScreen.tsx`,
`src/screens/SessionDetailScreen.tsx`, `src/screens/HistoryListScreen.tsx`
Bad example: Every set and every History row always draws `rowBordered`.
Good example: `showBottomBorder={!isLastSet}` / `index < rows.length - 1`.

## rule/buttons-do-not-carry-drop-shadows
Status: proposed
Scope: `PrimaryButton`, `SecondaryButton`, and any shared button shell
Rule: Do not put drop shadows on button primitives. Where sticky actions sit
above scrollable content, use `ScrollFadeView` (and chrome-level shadows on
sheets / sticky footers when needed) for separation — not per-button shadows.
Why: Scroll fade already handles the sticky-over-scroll relationship. Button
shadows were not specified on Figma button components and double up with fade
and chrome treatments.
Exceptions: `shadowAbove` remains valid on sheets, rest timer chrome, and
sticky footer containers — not on the buttons themselves.
Source: `src/components/ButtonShell.tsx`, `.cursor/rules/scroll-fade.mdc`,
`src/theme/shadow.ts`
Bad example: Spreading `shadowAbove` into `ButtonShell` so every CTA casts a
shadow even mid-scroll or inside a sheet.
Good example: Flat `ButtonShell`; `AppBottomSheet` / onboarding footer keep
chrome-level `shadowAbove` where the whole overlay lifts.

## rule/empty-vs-logged-layout-follows-job
Status: accepted
Scope: Work Out home
Rule: The first viewport should reorganize around the user's current job. With
no sets, center a vertical action stack. With logged sets, show the log as the
main surface and move actions to a compact pinned footer row.
Why: Before any sets exist, the job is to start logging. After sets exist, the
job is to review the current session while keeping the next action close.
Exceptions: None documented in current code.
Source: `src/screens/WorkOutScreen.tsx`
Bad example: Keeping the same dense footer row even when the screen is empty,
or keeping the empty-state stack after the log exists.
Good example: `hasSets` switches between `footerEmptyButtons` and `footerRow`.

## rule/layer-fixes-at-the-lowest-true-tier
Status: accepted
Scope: all user-facing UI changes
Rule: Fix behavior at the lowest layer that is true for every consumer. Do not
push single-screen quirks into shared primitives.
Why: The built surfaces already share components across onboarding, sheets, and
Work Out. One-off props create cross-flow breakage.
Exceptions: When a truly shared behavior changes across multiple consumers,
update the shared primitive and its contract test together.
Source: `.cursor/rules/component-layering.mdc`
Bad example: Adding a one-off prop to a shared button just to satisfy one Work
Out spacing quirk.
Good example: Work Out passes scroll offsets into `ScrollFadeView` instead of
teaching the component about workout-specific chrome.
