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
bun test             # run token validation tests
bun run lint         # lint/validate token source files
```

## Architecture

### Token Source (`src/`)

All source tokens live under `src/` in DTCG JSON format:

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
```

Each file uses the DTCG `$value` / `$type` / `$description` convention. Semantic tokens reference primitives via `{color.blue.500}` alias syntax — never hardcode values in semantic tokens.

### Style Dictionary Config (`style-dictionary.config.ts`)

Three SD instances run in sequence:
- `webBase` — primitive tokens only (`src/base.tokens.json`), outputs `base.css` + `base.ts`
- `webLight` — light theme (`src/theme/standard-light.json`), outputs `standard-light.css` + `standard-light.ts`
- `webDark` — dark theme (`src/theme/standard-dark.json`), outputs `standard-dark.css` + `standard-dark.ts`

Theme instances use SD `include` (for alias resolution) + `source` + `filter: isSource` to emit only the tokens defined in that theme file.

Custom transforms are in `src/sd/transforms.ts`; custom formats in `src/sd/formats.ts`.

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
`:root:not([data-theme="standard-light"])`, enabling OS-level auto-switching when no
explicit `data-theme` attribute is set.

### Dark Mode Color Scale Convention
Light theme: bg tokens use high shades (600–800), soft-bg uses low shades (50).
Dark theme: bg tokens use mid shades (300–400), soft-bg uses high shades (800–900).
This "flip" keeps perceived contrast roughly equivalent across schemes.
Exception: `warning.fg`, `danger.fg`, `success.fg`, `plain.fg` are `#000000` in dark
mode — their 400-shade backgrounds are too light (~2.5:1 with white, failing WCAG AA).
Only `primary.fg` keeps white because brand.400 (#5e4bde) yields 5.94:1 contrast.

### `vars` Export
Each theme TS module exports a `vars` constant — a flat `Record<string, string>`
mapping CSS custom property names to their resolved values
(e.g. `{ '--color-semantic-primary-bg': '#5e4bde' }`).
Purpose: SSR theme injection (apply tokens via inline styles without a stylesheet)
and runtime inspection of token values without `getComputedStyle`.
