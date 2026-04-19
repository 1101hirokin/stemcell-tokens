# stemcell-tokens

Design token pipeline for the **stemcell** universal design system.

Transforms [DTCG](https://design-tokens.github.io/community-group/format/)-format token sources into typed, platform-specific outputs using [Style Dictionary v5](https://styledictionary.com/).

## Installation

```sh
bun install
```

## Build

```sh
bun run build
```

Generates `dist/web/` containing CSS custom properties, ES module JS, and TypeScript declarations.

## Package Exports

```ts
import 'stemcell-tokens/base.css';           // primitive scale CSS vars
import 'stemcell-tokens/standard-light.css'; // :root, [data-theme="standard-light"]
import 'stemcell-tokens/standard-dark.css';  // [data-theme="standard-dark"] + @media prefers-color-scheme

import { color, spacing } from 'stemcell-tokens';                // CSS var name constants (base)
import { color, vars } from 'stemcell-tokens/standard-light';   // var names + resolved values
import { color, vars } from 'stemcell-tokens/standard-dark';    // same for dark theme
```

### `vars` export

Each theme module exports a flat `Record<string, string>` of CSS custom property names to their resolved values. Use this for SSR theme injection (without a stylesheet) or reading token values at runtime without `getComputedStyle`:

```ts
import { vars } from 'stemcell-tokens/standard-dark';

// Apply theme via inline styles (e.g. in SSR)
Object.entries(vars).forEach(([prop, val]) => {
  document.documentElement.style.setProperty(prop, val);
});
```

## Theme Switching

Themes are applied via the `data-theme` attribute. Dark mode also responds to the OS preference automatically when no explicit theme is set:

```html
<!-- explicit light theme -->
<html data-theme="standard-light">

<!-- explicit dark theme -->
<html data-theme="standard-dark">

<!-- OS preference (auto) — no attribute needed -->
<html>
```

## Architecture

```
src/
  base.tokens.json          # primitive scales (color, typography, spacing, shadow, motion)
  theme/
    standard-light.json     # light theme semantic layer
    standard-dark.json      # dark theme semantic layer
    theme-types.ts          # TypeScript types for theme JSON shape
  themes.ts                 # theme registry (name → JSON object)
  sd/
    transforms.ts           # custom Style Dictionary transforms
    formats.ts              # custom Style Dictionary output formats
style-dictionary.config.ts  # SD build pipeline (webBase / webLight / webDark)
```

## Token Authoring

- All tokens must have `$type` and `$description`.
- Semantic tokens must reference primitive aliases — never hardcode values.
- Breaking changes to token names require a major version bump.

See [`CLAUDE.md`](./CLAUDE.md) for detailed contributor guidance.
