// Style Dictionary build pipeline: base primitives + per-theme semantic layers.
// webBase emits tokens from all consumers; webLight/webDark emit only source tokens.
import StyleDictionary from 'style-dictionary';
import { registerTransforms, registerTransformGroups } from './src/sd/transforms.ts';
import { registerFormats } from './src/sd/formats.ts';

registerTransforms(StyleDictionary);
registerTransformGroups(StyleDictionary);
registerFormats(StyleDictionary);

// Typography composite tokens are expanded into individual sub-tokens
// (fontFamily, fontWeight, fontSize, lineHeight) so they each get their own CSS var.
const expandTypography = {
  include: (token: { $type?: string }) => token.$type === 'typography',
};

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
  source: ['src/theme/standard-light.json'],
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
  source: ['src/theme/standard-dark.json'],
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

await webBase.buildAllPlatforms();
await webLight.buildAllPlatforms();
await webDark.buildAllPlatforms();
