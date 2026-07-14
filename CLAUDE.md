# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`stemcell-tokens` is the design token pipeline for the **stemcell** universal design system. It uses [Style Dictionary](https://amzn.github.io/style-dictionary/) to transform token source files (in [DTCG](https://design-tokens.github.io/community-group/format/) format) into typed, platform-specific outputs consumable by Vue, Svelte, React, Lit, SwiftUI, Jetpack Compose, and other targets.

The generated artifacts (CSS custom properties, TypeScript types/values, Swift enums, Kotlin objects, etc.) are what downstream framework packages import — this repo owns the single source of truth for all design decisions.

## Runtime

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- `Bun.$\`ls\`` instead of execa.

## Commands

```sh
bun install          # install deps
bun run build        # run Style Dictionary transform (generates all platform outputs)
bun run check        # typecheck (tsc --noEmit)
```

There is no test or lint script. `bun run check` is the only gate, and it does not
check the token JSON — `src/themes.ts` casts the theme files through `as unknown`,
so nothing verifies token values, contrast ratios, or the `$type`/`$description` rule.

## Architecture

### Token Source (`src/`)

All source tokens live under `src/` in DTCG JSON format:

```
src/
  base.tokens.json          # theme-invariant tokens: color primitives, typography,
                            # spacing, shape, motion, focus-ring, layer (z-index),
                            # breakpoint, container, elevation levels
  theme/
    standard-light.json     # light theme: color semantic layer + elevation facets + scrim
    standard-dark.json      # dark theme: same
    theme-types.ts          # TypeScript types for theme JSON shape
  density/
    compact.json            # compact density: spacing overrides ([data-density])
  themes.ts                 # theme registry (name → JSON object)
  sd/
    transforms.ts           # custom Style Dictionary transforms
    formats.ts              # custom Style Dictionary output formats
```

Each file uses the DTCG `$value` / `$type` / `$description` convention. Semantic tokens reference primitives via `{color.blue.500}` alias syntax — never hardcode values in semantic tokens.

### What goes in which source file

A token belongs in a theme file if and only if its value varies by theme *and* a theme is
allowed to decide it. The theme SD instances filter on `isSource`, so a token only varies
by theme when a file sourced by that theme's instance authors it.

Those are two different questions, and `elevation` is where they come apart. Its facets do
vary by theme, but a theme does not get to decide them — elevation is a structural layer
and only its colours are overridable. So there are three homes, not two:

| File | Sourced by | Holds |
|---|---|---|
| `base.tokens.json` | `webBase` | theme-invariant tokens, including `elevation.*.level` |
| `elevation.tokens.json` | `webLight` **and** `webDark` | `elevation.*.surface` / `.shadow` — Stemcell's, resolved per theme |
| `theme/*.json` | its own instance | colours, including `app.shadow-umbra` / `-penumbra` |

`elevation.tokens.json` is not a theme file, so nothing a consumer authors reaches it, but
it is built into every theme. **Do not "simplify" this by emitting it once into
`base.css`.** A custom property holding `var()` is resolved where it is declared, so one
copy at `:root` would bake the root theme's shadow into the inherited value and
`[data-theme]` would stop working on any subtree — silently, with a green build. This was
tried; the browser proved it. It has to be declared inside each theme block.

Theme files may reference base primitives (`{color.gray.900}`) because each theme instance
`include`s base for alias resolution.

### Custom `$type`s control unit conversion

`stemcell/size/pxToRem` only matches `dimension` and `fontSize`. Types outside that set
are deliberate opt-outs, not oversights:

| `$type` | Result | Used by |
|---|---|---|
| `dimension`, `fontSize` | px → rem | spacing, focus-ring, container |
| `borderRadius` | px preserved | shape (a radius should not grow with text) |
| `breakpoint` | px preserved | breakpoint (must track native size classes) |
| `number` | passthrough | layer z-index, elevation level, motion scale |

### Style Dictionary Config (`style-dictionary.config.ts`)

Four SD instances run in sequence:
- `webBase` — theme-invariant tokens (`src/base.tokens.json`), outputs `base.css` + `base.ts`
- `webLight` — light theme (`src/theme/standard-light.json`), outputs `standard-light.css` + `standard-light.ts`
- `webDark` — dark theme (`src/theme/standard-dark.json`), outputs `standard-dark.css` + `standard-dark.ts`
- `webCompact` — compact density (`src/density/compact.json`), outputs `density-compact.css`

Theme and density instances use SD `include` (for alias resolution) + `source` + `filter: isSource` to emit only the tokens defined in that file.

Custom transforms are in `src/sd/transforms.ts`; custom formats in `src/sd/formats.ts`.

The config tail uses `Bun.write` directly, so the build requires bun — running it under
plain node emits every token file and then dies before writing `types.js`, `types.d.ts`,
and the `standard.css` bundle.

### `transitive: true` on value transforms

`stemcell/shadow/css` is marked `transitive`. SD value transforms run *before* reference
resolution by default, so a shadow whose colour aliases `{color.app.shadow}` would skip
the transform and emit `[object Object]` into the CSS — with a green build and a green
typecheck. Any future value transform that has to see through an alias needs this flag.

### Output (`dist/`)

Generated files go to `dist/` and are not committed to git. Current web output:

```
dist/
  web/          # CSS custom properties + ES module JS + .d.ts
  _ts/web/      # intermediate TypeScript (compiled by tsc → dist/web/)
```

### Package Registry

`.npmrc` points to a local Verdaccio registry at `localhost:4873`. Published packages from `dist/web/` are how downstream framework repos consume the tokens.

## Token Authoring Rules

- All tokens must have `$type` and `$description`.
- Semantic tokens must reference primitive aliases, never hardcode values.
- Breaking changes to token names require a major version bump.

## Theme Strategy

### CSS Selector Pattern
Each theme CSS file targets both `:root` and `[data-theme="<name>"]` so component
libraries can switch themes at runtime without reloading. Dark theme additionally emits
an `@media (prefers-color-scheme: dark)` block targeting
`:root:not([data-theme])`, enabling OS-level auto-switching when no
explicit `data-theme` attribute is set.

### Dark Mode Color Scale Convention
Light theme: bg tokens use high shades (600–800), soft-bg uses low shades (50).
Dark theme: bg tokens use mid shades (300–400), soft-bg uses high shades (800–900).
This keeps fg=#ffffff throughout while satisfying WCAG AA (500-shades yield 5.3:1+ with white).
Scale: Light bg=600/hover=700/pressed=800 · Dark bg=500/hover=400/pressed=300.

### `vars` Export
Each theme TS module exports a `vars` constant — a flat `Record<string, string>`
mapping CSS custom property names to their resolved values
(e.g. `{ '--color-semantic-primary-bg': '#5e4bde' }`).
Purpose: SSR theme injection (apply tokens via inline styles without a stylesheet)
and runtime inspection of token values without `getComputedStyle`.
