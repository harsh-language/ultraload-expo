# Copy

Load when changing labels, CTA text, accessible names, or explanatory helper
 text.

Route casing mechanics to `.cursor/rules/typography-text-case.mdc`.

## rule/author-ui-copy-in-lowercase
Status: accepted
Scope: user-facing labels, button text, titles, and menu items
Rule: Author UI copy in lowercase. Let components apply casing at render where
needed.
Why: Lowercase authoring is a repo-wide convention already enforced through
theme text-case helpers.
Exceptions: Semantic tokens that deliberately render `none` or `upper`, such as
weight labels (`100 kg`) and date labels (`31 oct`), still start from the
owning component's rendering rule rather than ad-hoc author text.
Source: `AGENTS.md`, `.cursor/rules/typography-text-case.mdc`, `src/components/AppBottomSheet.tsx`, `src/components/OptionsMenuDropdown.tsx`
Bad example: Authoring `Add Set`, `History`, or `Finish Profile` directly in
component props.
Good example: `add new set`, `history`, and `finish profile`.

## rule/logging-ctas-name-the-action-and-object
Status: accepted
Scope: add/edit set flow
Rule: Logging CTAs should name the action and the object being recorded or
saved. When the object is a standard set, include its display index. When it is
a warm-up set, name it explicitly.
Why: The user should know whether they are creating a standard set, creating a
warm-up set, or saving an edit before they tap.
Exceptions: The sheet title can stay broader (`add new set`, `edit set`) while
the primary CTA carries the specific action.
Source: `src/domain/set-labels.ts`, `src/components/AddSetSheet.tsx`
Bad example: Generic labels like `continue`, `done`, or `save changes`.
Good example: `record warmup set`, `record set 01`, `save warmup set`, `save set`.

## rule/surface-titles-stay-short-and-generic-primary-cta-carries-specificity
Status: accepted
Scope: bottom sheets and menus
Rule: Keep sheet titles short and stable; put the more specific action in the
primary CTA or in the destructive title when needed.
Why: The title anchors the surface type, while the CTA carries the consequence.
This reduces title churn while the user changes values inside the sheet.
Exceptions: Destructive surfaces may include the target in the title because the
consequence is the main point of the surface.
Source: `src/components/AddSetSheet.tsx`, `src/components/DeleteSetSheet.tsx`
Bad example: Rewriting the add-set sheet title every time the reps or weight
changes.
Good example: `add new set` / `edit set` as titles, with more specific CTA
labels beneath.

## rule/destructive-copy-names-the-target
Status: accepted
Scope: set deletion
Rule: Destructive copy should name the target being deleted. Warm-up sets use
their name; standard sets use the visible index.
Why: Deletion needs explicit scope so the user can verify they are removing the
right set.
Exceptions: The confirm button may stay `delete set` because the title and
preview already carry the target detail.
Source: `src/components/DeleteSetSheet.tsx`, `src/domain/set-labels.ts`
Bad example: A destructive title that only says `confirm delete`.
Good example: `delete warmup set` or `delete set 02` plus an inline preview row.
