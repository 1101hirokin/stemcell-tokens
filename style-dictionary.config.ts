// Style Dictionary build pipeline: base primitives + per-theme semantic layers.
// webBase emits tokens from all consumers; webLight/webDark emit only source tokens.
import StyleDictionary from 'style-dictionary';
import { registerTransforms, registerTransformGroups } from './src/sd/transforms.ts';
import { registerFormats } from './src/sd/formats.ts';
import { themes } from './src/themes.ts';

registerTransforms(StyleDictionary);
registerTransformGroups(StyleDictionary);
registerFormats(StyleDictionary);

// Typography composite tokens are expanded into individual sub-tokens
// (fontFamily, fontWeight, fontSize, lineHeight) so they each get their own CSS var.
const expandTypography = {
  include: (token: { $type?: string }) => token.$type === 'typography',
};

// Elevation's facets are Stemcell's, not a theme's, but they must be declared
// inside each theme block: a custom property holding var() resolves where it is
// declared, so one copy at :root would hand every subtree the root theme's
// shadow and [data-theme] would stop working below the root (Art.6). So the
// definition lives in one file and is built into every theme.
const elevationFacets = 'src/elevation.tokens.json';

const webBase = new StyleDictionary({
  log: { verbosity: 'default' },
  usesDtcg: true,
  expand: expandTypography,
  source: ['src/base.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'stemcell/web',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'base.css',
          format: 'css/variables',
          options: { outputReferences: false },
        },
      ],
    },
    ts: {
      transformGroup: 'stemcell/web',
      buildPath: 'dist/_ts/web/',
      files: [
        {
          destination: 'base.ts',
          format: 'stemcell/ts/css-var-names',
        },
      ],
    },
  },
});

// Theme file: base tokens are `include`d for alias resolution only and are NOT
// written to output; only the tokens defined in the theme file are emitted.
const sourceOnly = (token: { isSource: boolean }) => token.isSource;

const webLight = new StyleDictionary({
  log: { verbosity: 'default' },
  usesDtcg: true,
  include: ['src/base.tokens.json'],
  source: ['src/theme/standard-light.json', elevationFacets],
  platforms: {
    css: {
      transformGroup: 'stemcell/web',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'standard-light.css',
          format: 'css/variables',
          filter: sourceOnly,
          options: {
            selector: ':root, [data-theme="standard-light"]',
            outputReferences: false,
          },
        },
      ],
    },
    ts: {
      transformGroup: 'stemcell/web',
      buildPath: 'dist/_ts/web/',
      files: [
        {
          destination: 'standard-light.ts',
          format: 'stemcell/ts/css-var-names',
          filter: sourceOnly,
        },
      ],
    },
  },
});

const webDark = new StyleDictionary({
  log: { verbosity: 'default' },
  usesDtcg: true,
  include: ['src/base.tokens.json'],
  source: ['src/theme/standard-dark.json', elevationFacets],
  platforms: {
    css: {
      transformGroup: 'stemcell/web',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'standard-dark.css',
          format: 'stemcell/css/dark-theme',
          filter: sourceOnly,
          options: { outputReferences: false },
        },
      ],
    },
    ts: {
      transformGroup: 'stemcell/web',
      buildPath: 'dist/_ts/web/',
      files: [
        {
          destination: 'standard-dark.ts',
          format: 'stemcell/ts/css-var-names',
          filter: sourceOnly,
        },
      ],
    },
  },
});

// Density axis (orthogonal to theme): compact overrides for spacing semantic tokens,
// emitted under [data-density="compact"]. Base tokens are included for alias resolution only.
const webCompact = new StyleDictionary({
  log: { verbosity: 'default' },
  usesDtcg: true,
  include: ['src/base.tokens.json'],
  source: ['src/density/compact.json'],
  platforms: {
    css: {
      transformGroup: 'stemcell/web',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'density-compact.css',
          format: 'css/variables',
          filter: sourceOnly,
          options: { selector: '[data-density="compact"]', outputReferences: false },
        },
      ],
    },
    ts: {
      transformGroup: 'stemcell/web',
      buildPath: 'dist/_ts/web/',
      files: [
        {
          destination: 'density-compact.ts',
          format: 'stemcell/ts/css-var-names',
          filter: sourceOnly,
        },
      ],
    },
  },
});

await webBase.buildAllPlatforms();
await webLight.buildAllPlatforms();
await webDark.buildAllPlatforms();
await webCompact.buildAllPlatforms();

// Generate shared type declarations consumed by all stemcell framework packages.
// AVAILABLE_THEMES and BuiltInThemeKey are auto-derived from the themes registry.
const themeKeys = Object.keys(themes) as (keyof typeof themes)[];
const themeUnion = themeKeys.map(k => JSON.stringify(k)).join(' | ');
const themeTuple = themeKeys.map(k => JSON.stringify(k)).join(', ');

await Bun.write(
  'dist/web/types.js',
  `export const AVAILABLE_THEMES = Object.freeze([${themeKeys.map(k => JSON.stringify(k)).join(', ')}]);\n`,
);
await Bun.write(
  'dist/web/types.d.ts',
  `export declare const AVAILABLE_THEMES: readonly [${themeTuple}];
export type BuiltInThemeKey = ${themeUnion};
export type ThemeKey = 'auto' | BuiltInThemeKey | (string & {});
export type TokenTree = { [key: string]: string | TokenTree };
export interface CustomThemeDefinition {
  key: string;
  scheme: 'light' | 'dark';
  tokens: TokenTree;
}
`,
);

// Generate a convenience CSS bundle that imports all standard theme files in the
// correct order (base → light → dark), preventing import-order bugs.
await Bun.write(
  'dist/web/standard.css',
  `@import "./base.css";\n@import "./standard-light.css";\n@import "./standard-dark.css";\n@import "./density-compact.css";\n`,
);
