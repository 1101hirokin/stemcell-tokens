/**
 * Palette constraint checker.
 *
 * foundations/color.md §3 states two promises about how the primitive scales are
 * built, and then says the promises are kept by a checker rather than by the
 * generator: "保証は『生成器』ではなく CI の制約チェッカで行う". This is that
 * checker. Without it the promises are prose, and prose does not fail a build —
 * brand drifted out of both of them and nothing noticed until a button's hover
 * state turned out to be unreadable in dark.
 *
 * What it enforces:
 *
 *   1. Five rungs apart clears AA body text (4.5:1) — color.md §3-2. This is
 *      what lets an author pick two shades five apart and know the text is
 *      legible without measuring. It is also the tightest invariant the palette
 *      has: across the nine generated hues, five-apart lands in 4.83–5.53 while
 *      three-apart spreads 1.72–3.46. §3-2 did not pick five arbitrarily.
 *   2. Every scale climbs the same staircase. The nine hues agree on the
 *      contrast between adjacent rungs to two decimal places despite being
 *      different hues, so it is a real invariant rather than a coincidence.
 *
 * It deliberately does NOT require the rungs to be evenly spaced in OKLab L,
 * even though §3-1 asks to "段の跳びを根絶". §3-2 overrides §3-1 with a ただし:
 * even L does not produce constant contrast, so L is calibrated for contrast
 * instead. All nine hues jump hard at 400→500 by design. A checker enforcing
 * even L fails the reference palette — which would mean the checker is wrong,
 * not the palette. That was the first version of this file.
 *
 * It does not check the semantic layer. Those are aliases onto these scales, so
 * a scale that holds carries them.
 */

export type Rgb = readonly [number, number, number];

const AA_BODY = 4.5;
/** Rungs five apart, over the 50/100/…/900 ladder. */
const FIVE_APART: ReadonlyArray<readonly [string, string]> = [
  ['50', '500'],
  ['100', '600'],
  ['200', '700'],
  ['300', '800'],
  ['400', '900'],
];
const LADDER = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

/**
 * The staircase every scale is expected to climb: contrast between each pair of
 * adjacent rungs, 50→100 through 800→900.
 *
 * Read off the nine generated hues, which agree to within 0.02 of each other.
 * The 2.18 at 400→500 is intentional and shared by all of them.
 */
const STAIRCASE = [1.11, 1.28, 1.22, 1.29, 2.18, 1.20, 1.21, 1.34, 1.30] as const;

/**
 * How far a rung's step may sit from the staircase.
 *
 * A tolerance, not a derivation. Set loose enough that the nine hues pass with
 * room and tight enough that brand — whose staircase is a different shape
 * entirely — does not. Tighten it once the palette is re-authored and frozen
 * (color.md §9).
 */
const STAIRCASE_TOLERANCE = 0.15;

export function parseHex(hex: string): Rgb {
  const h = hex.trim().replace(/^#/, '');
  const full = h.length === 3 ? h.replace(/./g, c => c + c) : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Not a hex colour: ${hex}`);
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16)) as unknown as Rgb;
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance([r, g, b]: Rgb): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export type Violation = { hue: string; rule: string; detail: string };

export function checkScale(hue: string, shades: Record<string, string>): Violation[] {
  const out: Violation[] = [];
  const missing = LADDER.filter(s => !(s in shades));
  if (missing.length) {
    out.push({ hue, rule: 'ladder', detail: `missing rungs: ${missing.join(', ')}` });
    return out;
  }

  for (const [lo, hi] of FIVE_APART) {
    const c = contrast(parseHex(shades[lo]!), parseHex(shades[hi]!));
    if (c < AA_BODY) {
      out.push({
        hue,
        rule: 'five-apart-is-AA',
        detail: `${lo} vs ${hi} is ${c.toFixed(2)}:1, below ${AA_BODY} (color.md §3-2)`,
      });
    }
  }

  STAIRCASE.forEach((expected, i) => {
    const got = contrast(parseHex(shades[LADDER[i]!]!), parseHex(shades[LADDER[i + 1]!]!));
    const drift = Math.abs(got - expected) / expected;
    if (drift > STAIRCASE_TOLERANCE) {
      out.push({
        hue,
        rule: 'same-staircase',
        detail:
          `${LADDER[i]}→${LADDER[i + 1]} is ${got.toFixed(2)}:1, expected ~${expected.toFixed(2)}:1 ` +
          `(${(drift * 100).toFixed(0)}% off; the other scales agree here)`,
      });
    }
  });

  return out;
}
