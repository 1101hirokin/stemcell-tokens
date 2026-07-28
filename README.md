# @stemcell/tokens

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
import '@stemcell/tokens/base.css';           // primitive scale CSS vars
import '@stemcell/tokens/standard-light.css'; // :root, [data-theme="standard-light"]
import '@stemcell/tokens/standard-dark.css';  // [data-theme="standard-dark"] + @media prefers-color-scheme

import { color, spacing } from '@stemcell/tokens';                // CSS var name constants (base)
import { color, vars } from '@stemcell/tokens/standard-light';   // var names + resolved values
import { color, vars } from '@stemcell/tokens/standard-dark';    // same for dark theme
```

### `vars` export

Each theme module exports a flat `Record<string, string>` of CSS custom property names to their resolved values. Use this for SSR theme injection (without a stylesheet) or reading token values at runtime without `getComputedStyle`:

```ts
import { vars } from '@stemcell/tokens/standard-dark';

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

## 消費者のテーマを測る

ブランドの色を差し替えたら、その値が規約を満たすかは消費者の責任である（DS の約束は「stemcell の規定どおりに
使えば床が守られる」であって、渡された値まで守らせることではない）。測りたいときのために、物差しを配っている。
アプリの起動時には何も走らない。

```sh
# プロジェクト直下の stemcell.theme.json を測る
npx stemcell-theme check

# 場所を渡す / 標準入力から読む / 機械向けに出す
npx stemcell-theme check ./themes/acme.json
cat theme.json | npx stemcell-theme check -
npx stemcell-theme check --json
```

テーマの形。段は部分指定でよく、渡さなかった段は既定に落ちる。

```json
{ "scheme": "light", "colors": { "brand": { "600": "#5e4bde", "700": "#4a3ab5" } } }
```

測るのは**合成後の 10 段**である。渡した段だけを見ると、混ざり目の破綻（600 だけ差し替えて 100↔600 が
床を割る）を見落とす。階段の規約（5 段差＝AA、同じ階段を登る）と、意味の役へ配線された先（面の上の文字）を、
明暗の両方で測る。

終了コードは 0 が合格、1 が違反、2 が使い方の誤り。導入初日から赤にしたくなければ `--warn-only`。

```yaml
# GitHub Actions
- run: npx stemcell-theme check --json > theme-report.json
```

プログラムからも呼べる（消費者のテストへ埋め込む場合）。

```ts
import { checkTheme, defineTheme } from '@stemcell/tokens/theme';

const { violations } = checkTheme({ colors: { brand: { '600': '#5e4bde' } } });
const { css, dropped } = defineTheme({ key: 'acme', scheme: 'light', colors });
```

`defineTheme` は CSS を作る側で、測らない。キーの検証と値の検証はここが持つ（消費者の文字列が CSS になる
唯一の場所であり、テナントごとに色を選ばせる作りではその値が利用者由来になるため）。
