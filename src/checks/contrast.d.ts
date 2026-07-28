/**
 * Palette constraint checker.
 *
 * foundations/color.md §3 states two promises about how the primitive scales are
 * built, and then says the promises are kept by a checker rather than by the
 * generator: "保証は『生成の道具』ではなく CI の制約チェッカで行う". This is that
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
export declare function parseHex(hex: string): Rgb;
/** WCAG 2.x relative luminance. */
export declare function relativeLuminance([r, g, b]: Rgb): number;
export declare function contrast(a: Rgb, b: Rgb): number;
export type Violation = {
    hue: string;
    rule: string;
    detail: string;
};
export declare function checkScale(hue: string, shades: Record<string, string>): Violation[];
