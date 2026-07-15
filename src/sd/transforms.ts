// Custom Style Dictionary transforms for the stemcell/web platform.
import type StyleDictionary from 'style-dictionary';

type ShadowObject = {
  color?: string;
  alpha?: number;
  offsetX?: string | number;
  offsetY?: string | number;
  blur?: string | number;
  spread?: string | number;
  inset?: boolean;
};

function normalizeDim(val: string | number | undefined): string {
  if (val === undefined || val === null) return '0';
  const s = String(val).trim();
  return s === '0px' ? '0' : s;
}

/**
 * Apply an alpha to a resolved colour, as CSS.
 *
 * Tokens carry the colour as a plain alias and the alpha as a number, because a
 * source that every platform reads may not speak one platform's dialect
 * (Constitution Art.2). Composing them is the web transform's job, and it
 * composes to rgba() rather than color-mix(): the two are identical in sRGB, and
 * rgba() needs no fallback, so nothing has to degrade (Art.7).
 */
function withAlpha(color: string, alpha: number): string {
  const hex = color.trim();
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!m) {
    throw new Error(
      `Cannot apply alpha ${alpha} to ${color}: expected a 3- or 6-digit hex colour. ` +
        `Alias a colour token so it resolves to hex, and keep the alpha as a number.`,
    );
  }
  const digits = m[1] as string;
  const d = digits.length === 3 ? digits.replace(/./g, c => c + c) : digits;
  const [r, g, b] = [0, 2, 4].map(i => parseInt(d.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shadowToCSS(s: ShadowObject): string {
  const prefix = s.inset ? 'inset ' : '';
  const x = normalizeDim(s.offsetX);
  const y = normalizeDim(s.offsetY);
  const b = normalizeDim(s.blur);
  const sp = s.spread !== undefined ? ` ${normalizeDim(s.spread)}` : '';
  const base = s.color ?? '#000000';
  const c = s.alpha === undefined ? base : withAlpha(base, s.alpha);
  return `${prefix}${x} ${y} ${b}${sp} ${c}`;
}

export function registerTransforms(sd: typeof StyleDictionary): void {
  // Shadow: handle empty arrays (elevation flat) and convert to CSS box-shadow.
  // transitive: shadow colors alias {color.app.shadow}, and a non-transitive value
  // transform would run before that reference resolves and leave raw objects behind.
  sd.registerTransform({
    name: 'stemcell/shadow/css',
    type: 'value',
    transitive: true,
    filter: (token, options) => {
      const type = options.usesDtcg ? token.$type : token.type;
      return type === 'shadow';
    },
    transform: (token, _, options) => {
      const val: unknown = options.usesDtcg ? token.$value : token.value;
      if (Array.isArray(val)) {
        return val.length === 0 ? 'none' : (val as ShadowObject[]).map(shadowToCSS).join(', ');
      }
      if (val && typeof val === 'object') return shadowToCSS(val as ShadowObject);
      return String(val);
    },
  });

  // Colour + alpha: a colour token may alias another colour and declare an alpha
  // under $extensions.stemcell.alpha. Same reasoning as the shadow facet — the
  // source stays platform-neutral and this transform composes the CSS.
  // transitive, for the same reason the shadow transform is.
  sd.registerTransform({
    name: 'stemcell/color/alpha',
    type: 'value',
    transitive: true,
    filter: (token, options) => {
      const type = options.usesDtcg ? token.$type : token.type;
      return type === 'color' && typeof token.$extensions?.stemcell?.alpha === 'number';
    },
    transform: (token, _, options) => {
      const val = String(options.usesDtcg ? token.$value : token.value);
      return withAlpha(val, token.$extensions.stemcell.alpha as number);
    },
  });

  // px -> rem, but ONLY for px values. Leaves em / % / unitless untouched
  // (e.g. letter-spacing in em keeps its intended relative unit).
  sd.registerTransform({
    name: 'stemcell/size/pxToRem',
    type: 'value',
    filter: (token, options) => {
      const type = options.usesDtcg ? token.$type : token.type;
      // Only these two scale with the user's text. Every other type that carries a px
      // value is opting out on purpose: `borderRadius` (a corner should not grow with
      // the label), `breakpoint` (a threshold must mean the same width everywhere), and
      // `strokeWidth` (an a11y floor expressed in CSS px stops being a floor the moment
      // it can shrink — see foundations/focus-ring.md §4).
      return type === 'dimension' || type === 'fontSize';
    },
    transform: (token, _, options) => {
      const raw = String(options.usesDtcg ? token.$value : token.value).trim();
      if (raw.endsWith('px')) return `${parseFloat(raw) / 16}rem`;
      return raw;
    },
  });
}

export function registerTransformGroups(sd: typeof StyleDictionary): void {
  sd.registerTransformGroup({
    name: 'stemcell/web',
    transforms: [
      'name/kebab',
      'color/css',
      'stemcell/color/alpha',
      'fontFamily/css',
      'cubicBezier/css',
      'stemcell/shadow/css',
      'stemcell/size/pxToRem',
    ],
  });
}
