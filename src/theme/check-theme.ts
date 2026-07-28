/**
 * 消費者が渡したテーマ（ブランドの色）を測る道具。
 *
 * 実行時のゲートではない（裁定 2026-07-28）。DS の約束は「stemcell の規定どおりに使えば一定水準が
 * 守られる」であって、消費者が何を渡しても守らせることではない。ブランドの差し替えは消費者の判断で、
 * その結果の責任も消費者にある。だから測るのは、消費者が自分の CI で回したいときだけである。
 *
 * 測るのは合成後の 10 段である（裁定 2026-07-28）。部分指定を許すので、渡された段と既定の段が混ざった
 * ものが実物になる。渡された段だけを見ると、混ざり目の破綻（600 だけ差し替えて 100↔600 が床を割る）を
 * 見落とす。
 *
 * 三層を測る。
 *   1. 階段の規約（5 段差 = 4.5:1。color.md §3-2）
 *   2. 意味の役へ配線された先（面の上の文字、soft の面の上の文字）
 *   3. 明暗の両方（scheme を省いたら両方）
 */
import { contrast, parseHex, checkScale } from '../checks/contrast.ts';
import { distance, simulateOne } from '../checks/dataviz.ts';
import base from '../base.tokens.json' with { type: 'json' };
import light from './standard-light.json' with { type: 'json' };
import dark from './standard-dark.json' with { type: 'json' };

export const RUNGS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
export type Rung = (typeof RUNGS)[number];
export type Scheme = 'light' | 'dark';

export const CATEGORICAL = ['1', '2', '3', '4', '5', '6'] as const;
export type CategoricalRung = (typeof CATEGORICAL)[number];

/**
 * 消費者が渡す形。段は部分指定でよい（渡さなかった段は既定に落ちる）。
 *
 * dataviz を開いているのは、図の色が「ブランドの色」と同じ性質のものだからである（裁定 2026-07-29）。
 * 分類の色は系列の見分けが仕事で、それをどの色でやるかは消費者の絵づくりに属する。stemcell は
 * 既定を持ち、測る道具を渡し、差し替えを許す。守るかどうかの責任は差し替えた側にある。
 */
export type ThemeColors = {
  brand?: Partial<Record<Rung, string>>;
  dataviz?: { categorical?: Partial<Record<CategoricalRung, string>> };
};
export type ThemeInput = { scheme?: Scheme; colors: ThemeColors };

export type ThemeViolation = {
  scheme: Scheme;
  layer: 'ladder' | 'role' | 'dataviz';
  where: string;
  ratio: number;
  /** 床がある規則のときだけ入る(階段の一貫性のように、床ではなく形を見る規則もある)。 */
  floor?: number;
  /** 破れた規則の名前。 */
  rule: string;
  detail: string;
  hint: string;
};
export type ThemeReport = {
  merged: Record<Scheme, Record<Rung, string>>;
  violations: ThemeViolation[];
  checked: number;
};

const BODY_TEXT = 4.5;

type Node = { $value?: unknown; [k: string]: unknown };
const node = (tree: unknown, path: string): Node | undefined => {
  let n: unknown = tree;
  for (const k of path.split('.')) {
    if (n == null || typeof n !== 'object') return undefined;
    n = (n as Node)[k];
  }
  return n as Node | undefined;
};

/** 既定のブランドの 10 段。 */
export function defaultBrand(): Record<Rung, string> {
  const out = {} as Record<Rung, string>;
  for (const r of RUNGS) {
    const v = node(base, `color.brand.${r}`)?.$value;
    if (typeof v !== 'string') throw new Error(`既定の brand.${r} が読めない`);
    out[r] = v;
  }
  return out;
}

/** 渡された段を既定へ重ねる（渡さなかった段は既定のまま）。 */
export function mergeBrand(colors: ThemeColors): Record<Rung, string> {
  const merged = defaultBrand();
  for (const r of RUNGS) {
    const given = colors.brand?.[r];
    if (given) merged[r] = given;
  }
  return merged;
}

/** 図の分類の色の既定（テーマごと）。差し替えられなかった段はこれが残る。 */
export function defaultCategorical(scheme: Scheme): Record<CategoricalRung, string> {
  const theme = scheme === 'light' ? light : dark;
  const out = {} as Record<CategoricalRung, string>;
  for (const k of CATEGORICAL) {
    const raw = node(theme, `color.dataviz.categorical.${k}`)?.$value;
    if (typeof raw !== 'string') throw new Error(`既定の dataviz.categorical.${k} が読めない`);
    const m = /^\{color\.([a-z]+)\.([a-z0-9]+)(?:\.(\d+))?\}$/.exec(raw.trim());
    const resolved = m
      ? (node(base, m[3] ? `color.${m[1]}.${m[2]}.${m[3]}` : `color.${m[1]}.${m[2]}`)?.$value as string | undefined)
      : raw;
    if (typeof resolved !== 'string') throw new Error(`既定の dataviz.categorical.${k} が解けない（${raw}）`);
    out[k] = resolved;
  }
  return out;
}

/** 図が乗る面（テーマごと）。分類の色はこの面に対して 3:1 を満たす必要がある。 */
function chartSurface(scheme: Scheme): string {
  const theme = scheme === 'light' ? light : dark;
  let raw = node(theme, 'color.app.surface')?.$value as string | undefined;
  for (let i = 0; i < 4 && typeof raw === 'string' && raw.startsWith('{'); i++) {
    const path = raw.slice(1, -1);
    const from = path.startsWith('color.app.') ? theme : base;
    raw = node(from, path)?.$value as string | undefined;
  }
  return typeof raw === 'string' ? raw : '#FFFFFF';
}

/** 図の分類の色を測る。床は checks/dataviz.ts と同じ（既知の良いパレットから決めた値）。 */
function checkCategorical(scheme: Scheme, colors: ThemeColors, violations: ThemeViolation[]): number {
  const merged = defaultCategorical(scheme);
  for (const k of CATEGORICAL) {
    const given = colors.dataviz?.categorical?.[k];
    if (given) merged[k] = given;
  }
  const surface = parseHex(chartSurface(scheme));
  let checked = 0;
  for (const k of CATEGORICAL) {
    checked += 1;
    let rgb;
    try {
      rgb = parseHex(merged[k]);
    } catch {
      violations.push({
        scheme, layer: 'dataviz', where: `dataviz.categorical.${k}`, ratio: 0,
        rule: '色として読める値であること',
        detail: `dataviz.categorical.${k} が色として読めない（${merged[k]}）`,
        hint: '16 進の色で渡す',
      });
      continue;
    }
    const ratio = contrast(rgb, surface);
    if (ratio < 3) {
      violations.push({
        scheme, layer: 'dataviz', where: `dataviz.categorical.${k}`, ratio: Number(ratio.toFixed(2)), floor: 3,
        rule: '図形と地の対比は 3:1 (WCAG 2.2 SC 1.4.11)',
        detail: `dataviz.categorical.${k}（${merged[k]}）が図の面の上で ${ratio.toFixed(2)}:1（床 3）`,
        hint: `${scheme} の図の面は ${chartSurface(scheme)}。色を面から離す`,
      });
    }
  }
  const kinds = [
    { kind: 'normal' as const, floor: 0.1, label: '通常の視覚' },
    { kind: 'deuteranopia' as const, floor: 0.02, label: '2 型色覚の模擬' },
    { kind: 'protanopia' as const, floor: 0.02, label: '1 型色覚の模擬' },
  ];
  for (const { kind, floor, label } of kinds) {
    for (const a of CATEGORICAL) {
      for (const b of CATEGORICAL) {
        if (a >= b) continue;
        let d: number;
        try {
          const x = parseHex(merged[a]);
          const y = parseHex(merged[b]);
          d = distance(kind === 'normal' ? x : simulateOne(x, kind), kind === 'normal' ? y : simulateOne(y, kind));
        } catch {
          continue;
        }
        checked += 1;
        if (d >= floor) continue;
        violations.push({
          scheme, layer: 'dataviz', where: `dataviz.categorical.${a} ↔ ${b}`, ratio: Number(d.toFixed(3)), floor,
          rule: `分類の色は隣り合っても見分けられること（${label}）`,
          detail: `${a}（${merged[a]}）と ${b}（${merged[b]}）の OKLab 距離が ${d.toFixed(3)}（床 ${floor}。${label}）`,
          hint: '色相を離すか、明度に差を付ける',
        });
      }
    }
  }
  return checked;
}

/** 意味の役が引く段（テーマごとに違う）。面の上の文字と対で見る。 */
function rolePairs(scheme: Scheme, brand: Record<Rung, string>) {
  const theme = scheme === 'light' ? light : dark;
  const read = (path: string): string | undefined => {
    const v = node(theme, path)?.$value;
    if (typeof v !== 'string') return undefined;
    const m = /^\{color\.brand\.(\d+)\}$/.exec(v.trim());
    return m ? brand[m[1] as Rung] : v;
  };
  const pairs: Array<{ where: string; fg?: string; bg?: string }> = [
    { where: 'primary.bg の上の文字', bg: read('color.semantic.primary.bg'), fg: read('color.semantic.primary.fg') },
    { where: 'primary.bg-hover の上の文字', bg: read('color.semantic.primary.bg-hover'), fg: read('color.semantic.primary.fg') },
    { where: 'primary.bg-pressed の上の文字', bg: read('color.semantic.primary.bg-pressed'), fg: read('color.semantic.primary.fg') },
    { where: 'primary.soft-bg の上の soft-fg', bg: read('color.semantic.primary.soft-bg'), fg: read('color.semantic.primary.soft-fg') },
    { where: 'primary.soft-bg-hover の上の soft-fg', bg: read('color.semantic.primary.soft-bg-hover'), fg: read('color.semantic.primary.soft-fg') },
    { where: 'primary.soft-bg-pressed の上の soft-fg', bg: read('color.semantic.primary.soft-bg-pressed'), fg: read('color.semantic.primary.soft-fg') },
  ];
  return pairs.filter((p): p is { where: string; fg: string; bg: string } => !!p.fg && !!p.bg);
}

const rungOf = (brand: Record<Rung, string>, value: string): Rung | undefined =>
  RUNGS.find((r) => brand[r].toLowerCase() === value.toLowerCase());

export function checkTheme(input: ThemeInput): ThemeReport {
  const schemes: Scheme[] = input.scheme ? [input.scheme] : ['light', 'dark'];
  const brand = mergeBrand(input.colors);
  const violations: ThemeViolation[] = [];
  let checked = 0;

  // 1. 階段の規約。合成後の 10 段を、既定のスケールと同じ規則で測る(規則ごとの床は checkScale が持つ)
  for (const v of checkScale('brand', brand)) {
    const m = /(\d+)[^0-9]{1,12}(\d+)/.exec(v.detail);
    const ratio = /([\d.]+):1/.exec(v.detail);
    violations.push({
      scheme: schemes[0]!,
      layer: 'ladder',
      where: m ? `brand.${m[1]} ↔ brand.${m[2]}` : 'brand の階段',
      ratio: ratio ? Number(ratio[1]) : 0,
      floor: v.rule.includes('4.5') || v.rule.includes('AA') ? BODY_TEXT : 0,
      detail: v.detail,
      rule: v.rule,
      hint: m
        ? `いま brand.${m[1]} は ${brand[m[1] as Rung] ?? '既定'}、brand.${m[2]} は ${brand[m[2] as Rung] ?? '既定'}`
        : '合成後の 10 段が同じ階段を登るようにする',
    });
  }
  checked += 5; // 5 段差の対は 5 組

  // 2 と 3. 意味の役と、明暗の両方
  for (const scheme of schemes) {
    for (const pair of rolePairs(scheme, brand)) {
      checked += 1;
      const ratio = contrast(parseHex(pair.fg), parseHex(pair.bg));
      if (ratio >= BODY_TEXT) continue;
      const rung = rungOf(brand, pair.bg);
      violations.push({
        scheme,
        layer: 'role',
        where: pair.where,
        ratio: Number(ratio.toFixed(2)),
        floor: BODY_TEXT,
        rule: '面の上の文字は 4.5:1 (WCAG 2.2 SC 1.4.3)',
        detail: `${pair.where} が ${ratio.toFixed(2)}:1（床 ${BODY_TEXT}。WCAG 2.2 SC 1.4.3）`,
        hint: rung
          ? `${scheme} の この面は brand.${rung}（${pair.bg}）を引いている。その段を動かす`
          : `面は ${pair.bg}、文字は ${pair.fg}`,
      });
    }
  }

  // 4. 図の分類の色（差し替えたときだけ意味を持つが、既定との混ざり目も見るので常に測る）
  for (const scheme of schemes) checked += checkCategorical(scheme, input.colors, violations);

  return {
    merged: {
      light: brand,
      dark: brand,
    },
    violations,
    checked,
  };
}
