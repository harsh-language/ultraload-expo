# Lint Candidates

List only mechanical rules worth automating later. Do not implement linters in
this change.

For each candidate, apply the article's decision tree: can code identify the
failure without rendering, can the rule avoid likely false positives, and does
the violation have a concrete fix?

## candidate/no-raw-central-icons-in-screens

- Current owner: `.cursor/rules/icons.mdc`
- Checkable without rendering: yes
- Likely false positives: low
- Concrete fix: yes
- Candidate: reject imports from `central-icons` / `central-icons-filled` inside
  `src/screens/**`; require wrappers from `src/components/icons/`
- Evidence: `AGENTS.md`, `.cursor/rules/icons.mdc`

## candidate/no-ad-hoc-text-transform-or-font-metrics

- Current owner: `.cursor/rules/typography-text-case.mdc`
- Checkable without rendering: yes
- Likely false positives: medium
- Concrete fix: usually yes
- Candidate: flag direct `fontSize`, `fontFamily`, or `textTransform` in UI
  modules when a `typography.*` or `textCase.*` helper should be used instead
- Evidence: `.cursor/rules/typography-text-case.mdc`, `src/theme/typography.ts`, `src/theme/textCase.ts`

## candidate/no-hardcoded-panel-durations

- Current owner: `.cursor/rules/panel-motion.mdc`
- Checkable without rendering: yes
- Likely false positives: low
- Concrete fix: yes
- Candidate: flag hardcoded panel durations and require
  `PANEL_TRANSITION_MS` / `panelTransitionTiming` for sheets, menus, dropdowns,
  and accordions
- Evidence: `.cursor/rules/panel-motion.mdc`, `src/theme/motion.ts`

## candidate/no-hand-edits-to-figma-token-file

- Current owner: `.cursor/rules/figma-design-tokens.mdc`
- Checkable without rendering: yes
- Likely false positives: low
- Concrete fix: yes
- Candidate: protect `src/theme/tokens.ts` from manual edits outside token
  export workflow
- Evidence: `AGENTS.md`, `.cursor/rules/figma-design-tokens.mdc`

## candidate/prefer-scroll-fade-view-for-fixed-viewport-scroll

- Current owner: `.cursor/rules/scroll-fade.mdc`
- Checkable without rendering: partially
- Likely false positives: medium to high
- Concrete fix: sometimes
- Candidate: warning only, not a strict lint yet. Look for vertically scrolling
  fixed viewports using bare `ScrollView` where `ScrollFadeView` is the accepted
  pattern.
- Evidence: `.cursor/rules/scroll-fade.mdc`, `src/screens/WorkOutScreen.tsx`

## candidate/no-manual-button-alignment-props

- Current owner: `.cursor/rules/button-content-alignment.mdc`
- Checkable without rendering: yes
- Likely false positives: medium
- Concrete fix: yes
- Candidate: forbid ad-hoc alignment props or per-callsite flex hacks on
  `PrimaryButton` / `SecondaryButton` when `getButtonContentLayout` should own
  the behavior
- Evidence: `.cursor/rules/button-content-alignment.mdc`, `src/components/buttonContentLayout.ts`

## candidate-lowest-true-layer-test-mandate

- Current owner: `.cursor/rules/component-layering.mdc`
- Checkable without rendering: partially
- Likely false positives: medium
- Concrete fix: sometimes
- Candidate: meta-check or review assistant rather than strict lint. Detect when
  shared pure logic changes without a nearby contract-test update.
- Evidence: `.cursor/rules/component-layering.mdc`
