# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Design tokens

UI spacing, radius, borders, and colors come from Figma variables in [`src/theme/tokens.ts`](src/theme/tokens.ts). Regenerate with `figma_export_tokens` — never edit that file by hand. For 8-digit transparent tokens in SVG or opacity-only APIs, use [`resolveColorToken`](src/theme/resolveColorToken.ts). See [`.cursor/rules/figma-design-tokens.mdc`](.cursor/rules/figma-design-tokens.mdc) for mapping and conventions.

## Dependencies

Central Icons requires `CENTRAL_LICENSE_KEY` in `.env` (copy from `.env.example`).

- Outlined: `central-icons` → `@central-icons-react-native/square-outlined-radius-0-stroke-2`
- Filled: `central-icons-filled` → `@central-icons-react-native/square-filled-radius-0-stroke-2`

- First-time install: `npm run install:deps`
- With [direnv](https://direnv.net/): run `direnv allow` once, then `npm install` works normally
