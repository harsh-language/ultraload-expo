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
`ScrollFadeView` and uses `topOffset` / `bottomOffset`.

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
