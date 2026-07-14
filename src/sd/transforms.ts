// Custom Style Dictionary transforms for the stemcell/web platform.
import type StyleDictionary from 'style-dictionary';

type ShadowObject = {
  color?: string;
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

function shadowToCSS(s: ShadowObject): string {
  const prefix = s.inset ? 'inset ' : '';
  const x = normalizeDim(s.offsetX);
  const y = normalizeDim(s.offsetY);
  const b = normalizeDim(s.blur);
  const sp = s.spread !== undefined ? ` ${normalizeDim(s.spread)}` : '';
  const c = s.color ?? '#000000';
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

  // px -> rem, but ONLY for px values. Leaves em / % / unitless untouched
  // (e.g. letter-spacing in em keeps its intended relative unit).
  sd.registerTransform({
    name: 'stemcell/size/pxToRem',
    type: 'value',
    filter: (token, options) => {
      const type = options.usesDtcg ? token.$type : token.type;
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
      'fontFamily/css',
      'cubicBezier/css',
      'stemcell/shadow/css',
      'stemcell/size/pxToRem',
    ],
  });
}
