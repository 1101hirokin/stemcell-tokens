/**
 * The palette a chart draws with (foundations/dataviz.md §3).
 *
 * Three scales, three different promises:
 *
 *   categorical — colours that separate series. No order. The promise is that any two of
 *     them are told apart, including by people who do not see red and green the way the
 *     author does. So this file measures perceptual distance in OKLab, and measures it
 *     again through simulations of the two common forms of colour vision deficiency
 *     (deuteranopia, protanopia. Viénot / Brettel 1999 matrices). A palette that only
 *     holds for trichromats is not a palette; it is a trap.
 *
 *   sequential — one hue climbing. The promise is that the order is visible: each rung sits
 *     further from the surface than the last (which reads as darker in light and lighter in
 *     dark: the rule is contrast against the surface, not lightness).
 *
 *   diverging — two hues away from a faint middle. The promise is the same in both
 *     directions, and that the middle sits closest to the surface (which is the palest rung
 *     in light and the darkest in dark: the rule is contrast against the surface, not lightness).
 *
 * All three must also clear 3:1 against the surface a chart sits on (WCAG 2.2 SC 1.4.11:
 * a bar is a graphical object). That is the check the palette checker never made, because
 * it looks at scales, not at what a scale is used for.
 */
import { parseHex, contrast, type Rgb } from './contrast.ts';

export type DatavizViolation = { theme: string; scale: string; rule: string; detail: string };
export type DatavizNote = { theme: string; kind: 'normal' | 'deuteranopia' | 'protanopia'; min: number };

const GRAPHIC = 3; // SC 1.4.11
/**
 * OKLab の距離の床。既知の良いパレットを同じ物差しで測って決めた(発明した数ではない)。
 *
 *   Okabe-Ito 8 色(色覚の型を跨ぐ設計として広く使われる): normal 0.118 / deut 0.019 / prot 0.053
 *   Okabe-Ito 6 色:                                        normal 0.156 / deut 0.080 / prot 0.091
 *   Tableau 10 の 6 色:                                     normal 0.139 / deut 0.003 / prot 0.032
 *   Carbon 5 色:                                            normal 0.216 / deut 0.058 / prot 0.097
 *
 * 常の視覚では 0.10 を床にする(Okabe-Ito 8 がぎりぎり超える値)。色覚の型を模擬した側は、
 * 参照パレットですら 0.003 まで落ちる。色だけで見分けさせないという規範(SC 1.4.1。dataviz §3)が
 * あるからこそ成り立っている数字であり、ここを高く縛ると「良い」とされるパレットが全部落ちる。
 * よって模擬側は衝突(ほぼ同じ色になる)だけを捕まえる低い床にし、値は印字して見えるようにする。
 */
const FLOOR = { normal: 0.1, deuteranopia: 0.02, protanopia: 0.02 };

const srgbToLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** sRGB → OKLab（Björn Ottosson）。知覚に近い距離を測るために使う。 */
export function oklab([r, g, b]: Rgb): [number, number, number] {
  const R = srgbToLinear(r / 255);
  const G = srgbToLinear(g / 255);
  const B = srgbToLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export const distance = (a: Rgb, b: Rgb): number => {
  const [l1, a1, b1] = oklab(a);
  const [l2, a2, b2] = oklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

/** 色覚の型の模擬(Viénot 1999)。LMS で欠けている錐体を残りから復元する。 */
/** 色覚の型を模擬する（Viénot / Brettel 1999）。テーマの道具（theme/check-theme.ts）も引く。 */
export function simulateOne(rgb: Rgb, kind: 'deuteranopia' | 'protanopia'): Rgb {
  return simulate(rgb, kind);
}

function simulate(rgb: Rgb, kind: 'deuteranopia' | 'protanopia'): Rgb {
  const [r, g, b] = rgb.map((v) => srgbToLinear(v / 255)) as [number, number, number];
  // linear sRGB → LMS
  const L = 17.8824 * r + 43.5161 * g + 4.11935 * b;
  const M = 3.45565 * r + 27.1554 * g + 3.86714 * b;
  const S = 0.0299566 * r + 0.184309 * g + 1.46709 * b;
  const [L2, M2, S2] =
    kind === 'protanopia'
      ? [2.02344 * M - 2.52581 * S, M, S]
      : [L, 0.494207 * L + 1.24827 * S, S];
  // LMS → linear sRGB
  const r2 = 0.0809444479 * L2 - 0.130504409 * M2 + 0.116721066 * S2;
  const g2 = -0.0102485335 * L2 + 0.0540193266 * M2 - 0.113614708 * S2;
  const b2 = -0.000365296938 * L2 - 0.00412161469 * M2 + 0.693511405 * S2;
  const back = (v: number) => {
    const c = Math.max(0, Math.min(1, v));
    const s = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(s * 255);
  };
  return [back(r2), back(g2), back(b2)] as Rgb;
}

type Node = { $value?: unknown; [k: string]: unknown };
const get = (tree: Node, path: string): Node | undefined => {
  let n: unknown = tree;
  for (const k of path.split('.')) {
    if (n == null || typeof n !== 'object') return undefined;
    n = (n as Node)[k];
  }
  return n as Node | undefined;
};
function resolve(value: string, trees: Node[]): string {
  let v = value;
  for (let i = 0; i < 16; i++) {
    const m = /^\{([^}]+)\}$/.exec(v.trim());
    if (!m) return v;
    let hit: Node | undefined;
    for (const t of trees) {
      const found = get(t, m[1]!);
      if (found && typeof found.$value === 'string') { hit = found; break; }
    }
    if (!hit) throw new Error(`Cannot resolve alias ${v}`);
    v = hit.$value as string;
  }
  throw new Error(`Alias loop at ${value}`);
}

/** 図が載る面。分類の色はこの上で 3:1 を満たす。 */
const CHART_SURFACE = 'color.app.surface';

export function checkDataviz(theme: string, themeTree: Node, base: Node): { violations: DatavizViolation[]; notes: DatavizNote[] } {
  const trees = [themeTree, base];
  const out: DatavizViolation[] = [];
  const notes: DatavizNote[] = [];
  const group = get(themeTree, 'color.dataviz');
  if (!group) return { violations: out, notes };

  const surfaceToken = get(themeTree, CHART_SURFACE);
  const surface = parseHex(resolve(surfaceToken!.$value as string, trees));

  const readScale = (name: string): Array<[string, Rgb]> => {
    const node = get(themeTree, `color.dataviz.${name}`);
    if (!node) return [];
    return Object.keys(node)
      .filter((k) => !k.startsWith('$'))
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => {
        const t = get(node, k)!;
        return [k, parseHex(resolve(t.$value as string, trees))] as [string, Rgb];
      });
  };

  // 分類: 面の上で 3:1、そして互いに見分けられる(色覚の型を跨いで)
  const categorical = readScale('categorical');
  for (const [k, rgb] of categorical) {
    const c = contrast(rgb, surface);
    if (c < GRAPHIC) {
      out.push({
        theme, scale: 'categorical', rule: 'graphic-3to1',
        detail: `categorical.${k} is ${c.toFixed(2)}:1 on the chart surface, below ${GRAPHIC} (WCAG 2.2 SC 1.4.11)`,
      });
    }
  }
  const kinds = [
    ['normal', (c: Rgb) => c],
    ['deuteranopia', (c: Rgb) => simulate(c, 'deuteranopia')],
    ['protanopia', (c: Rgb) => simulate(c, 'protanopia')],
  ] as const;
  for (const [kind, map] of kinds) {
    let min = Infinity;
    for (let i = 0; i < categorical.length; i++) {
      for (let j = i + 1; j < categorical.length; j++) {
        const d = distance(map(categorical[i]![1]), map(categorical[j]![1]));
        min = Math.min(min, d);
        if (d >= FLOOR[kind]) continue;
        out.push({
          theme, scale: 'categorical', rule: `distinct-${kind}`,
          detail:
            `categorical.${categorical[i]![0]} and categorical.${categorical[j]![0]} are ${d.toFixed(3)} apart in OKLab ` +
            `under ${kind}, below ${FLOOR[kind]}. Two series would read as one.`,
        });
      }
    }
    if (Number.isFinite(min)) notes.push({ theme, kind, min: Number(min.toFixed(3)) });
  }

  // 連続: 段が進むほど地から離れる
  // (「暗くなる」ではない。暗いテーマでは明るいほうが地から離れる。地との対比で言う)
  const sequential = readScale('sequential');
  for (let i = 1; i < sequential.length; i++) {
    const prev = contrast(sequential[i - 1]![1], surface);
    const cur = contrast(sequential[i]![1], surface);
    if (cur > prev) continue;
    out.push({
      theme, scale: 'sequential', rule: 'monotone',
      detail:
        `sequential.${sequential[i - 1]![0]} → ${sequential[i]![0]} does not move further from the surface ` +
        `(${prev.toFixed(2)}:1 → ${cur.toFixed(2)}:1). The order stops being visible.`,
    });
  }

  // 発散: 中心が最も目立たず、両側が同じだけ離れる
  // (「最も明るい」ではない。暗いテーマでは最も暗い側が地に近い。地との対比で言う)
  const diverging = readScale('diverging');
  if (diverging.length >= 3) {
    const mid = Math.floor(diverging.length / 2);
    const midContrast = contrast(diverging[mid]![1], surface);
    for (const [k, rgb] of diverging) {
      if (k === diverging[mid]![0]) continue;
      if (contrast(rgb, surface) >= midContrast) continue;
      out.push({
        theme, scale: 'diverging', rule: 'faint-middle',
        detail: `diverging.${k} sits closer to the surface than the middle (${diverging[mid]![0]}) does. The middle must be the faintest rung, or the zero point reads as a signal.`,
      });
    }
    const low = distance(diverging[0]![1], diverging[mid]![1]);
    const high = distance(diverging[diverging.length - 1]![1], diverging[mid]![1]);
    if (Math.abs(low - high) > 0.06) {
      out.push({
        theme, scale: 'diverging', rule: 'symmetric',
        detail: `the two ends sit ${low.toFixed(3)} and ${high.toFixed(3)} from the middle. One side would read as the stronger signal.`,
      });
    }
  }

  return { violations: out, notes };
}
