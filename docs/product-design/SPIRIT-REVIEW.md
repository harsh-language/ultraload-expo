# Spirit review vs Vercel product-design article

Date: 2026-07-17  
Source article: `docs/agentic-product-design.md`  
Skill: `harsh-product-design` (renamed from `product-design`)

Purpose: durable notes for combining or evolving product-design guidance. Do not
treat this file as runtime guidance — agents should load the global skill
`harsh-product-design` and this project's `docs/product-design/references/`.

## Verdict

Mostly yes on spirit; partially yes on depth.

The article’s real point isn’t “write a skill folder.” It’s: agents can copy what shipped, but not *why* it became the standard — so accepted product decisions must live in the repo, route to owners instead of duplicating them, and grow only through evidence + human approval.

This skill hits that architecture: modes, routing, decision records, exemplars, coverage gaps, lint candidates, learn mode, and the `AGENTS.md` trigger with a load report.

## What matches well

- Treats decisions like code (stable IDs, sources, bad/good examples)
- Starts with one repeated surface (add-set / Work Out)
- Routes to existing `.mdc` owners instead of restating them; build mechanics
  live in-skill for Implement
- Separates judgment (skill) from mechanical checks (lint candidates later)
- Replaces Vercel’s Slack review loop with a learning loop suited to active construction
- Explicitly refuses to auto-accept from one file

## Where it’s thinner than the article

1. **More “what exists” than “why we chose it.”** Many rules correctly describe shipped behavior. The harder ask is review-room rationale — tradeoffs, rejected alternatives, exceptions. Exemplars are good summaries; they’re not yet PR-grade stories of a decision and the mistake it prevents.

2. **A bit heavy for a first cut.** The article says start with *repeated* decisions. There are ~25 accepted rules with some overlap (`defaults` in both product-judgment and surfaces; empty-state layout in both interface-quality and surfaces). That dilutes the “observable, narrow, high-signal” spirit.

3. **Missing a few article pieces that matter for agents:**
   - Glossary — canonical names (`Work Out`, `W`, warm-up vs warmup in copy, standard set)
   - Review output contract — P0–P3 findings with consequence + smallest fix
   - Skill-local governance — load order / what “accepted” means (their skill-local `AGENTS.md`)
   - Material decision definition — when a change is judgment vs mechanical substitution

4. **Verify step is slightly web-shaped.** Keyboard/RTL/localization checks can become checkbox theater for this RN solo app. The article’s real verify bar is: don’t claim visual quality from code alone.

5. **No evals yet** — correctly deferred, but that’s the article’s answer to “does the skill actually change agent behavior?” Without one holdout fixture someday, you can’t know if learn/mode routing works.

## Subtract (tighten)

- Deduplicate overlapping rules; keep one owner per decision
- Slim `interface-quality.md` where it only restates design-fills / layering / scroll-fade
- Soften or RN-localize the verify checklist
- Resist accepting more rules until learn mode surfaces *repeated* contradictions

## Add (highest leverage)

- `glossary.md` for product vocabulary
- P0–P3 review format in the global skill
- Stronger “why / rejected alternative” in exemplars (even 2–3 lines each)
- Explicit “material vs mechanical” gate so copy/token swaps don’t expand into redesigns
- One real `learn` pass soon — the system is only alive if the loop runs

## Keep as-is

- Routing to existing rules
- Lint candidates without writing linters yet
- Human-gated `proposed`
- Coverage gaps for taxonomy drift

## Implication for skill combinations

Updated 2026-07-17: `/build-ui` was merged into `harsh-product-design`.
Updated 2026-07-17: skill process moved global (`~/Code/cursor/skills/harsh-product-design/`); UltraLoad product truth lives in `docs/product-design/`.

- Global `harsh-product-design` is the single UI entry point
- Product judgment stays in local `docs/product-design/references/`
- Figma → compose → contract-test mechanics live in the global skill **Build mechanics**
  (Implement; Harden only when composition is required)
- Existing `.cursor/rules/*.mdc` remain canonical owners for tokens, motion,
  icons, layering, etc.
- Prefer sharpening + running learn over expanding the rule catalog
- Preserve: one entry point, route-don’t-duplicate, human acceptance gate, and
  load reporting
