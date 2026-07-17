# Product design (UltraLoad)

Local product decisions for UI work. Process lives in the global skill
`harsh-product-design` (personal Cursor kit → `~/.cursor/skills`).

## Layout

| Path | Role |
| --- | --- |
| `references/` | Accepted / proposed product rules |
| `exemplars/` | Good/bad examples from shipped code |
| `coverage-gaps.md` | Missing standards and contradictions |
| `lint-candidates.md` | Mechanical rules for later automation |
| `SPIRIT-REVIEW.md` | Historical notes vs the Vercel article (not runtime) |

## How agents use this

1. Load skill `harsh-product-design`
2. Read this tree for product judgment
3. Route visual mechanics to `.cursor/rules/*.mdc` via `references/routing.md`

Do not put an invokable `SKILL.md` here.
