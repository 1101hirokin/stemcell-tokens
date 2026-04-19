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

### Token Source (`tokens/`)

All source tokens live under `tokens/` in DTCG JSON format. Files are organized by category:

```
tokens/
  color/       # base + semantic color tokens
  typography/  # font families, sizes, weights, line-heights
  spacing/     # scale values
  radius/      # border radius
  shadow/      # elevation / box-shadow
  motion/      # duration, easing
  ...
```

Each file uses the DTCG `$value` / `$type` / `$description` convention. Composite tokens reference primitives via `{color.blue.500}` alias syntax.

### Style Dictionary Config (`style-dictionary.config.ts`)

The config defines **one platform entry per output target**. Each platform specifies:
- `source` — which token files to include
- `transforms` — how values are converted (e.g. px → rem, hex → rgba)
- `format` — the output format (css/variables, javascript/es6, ios-swift, android/compose)
- `destination` — output file path under `dist/`

Custom transforms and formats are registered in `src/transforms/` and `src/formats/` respectively.

### Output (`dist/`)

Generated files go to `dist/` and are not committed to git. Each platform gets its own subdirectory:

```
dist/
  css/          # CSS custom properties (web)
  js/           # ES module JS + TypeScript type declarations
  swift/        # Swift enums/structs for SwiftUI
  kotlin/        # Kotlin objects for Jetpack Compose
  json/          # Raw resolved token JSON (consumed by other tools)
```

### Package Registry

`.npmrc` points to a local Verdaccio registry at `localhost:4873`. Published packages from `dist/` are how downstream framework repos consume the tokens.

## Token Authoring Rules

- All tokens must have `$type` and `$description`.
- Semantic tokens must reference primitive aliases, never hardcode values.
- Breaking changes to token names require a major version bump.
