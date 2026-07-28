/**
 * WCAG 2.2 SC 1.4.3 for the text that sits on an intent's fill — in every state.
 *
 * The palette check asks whether a scale is built correctly. The border check asks
 * which rung got wired to the border. Neither asks the question this file asks:
 * once `fg` is pinned to a single colour (white on filled intents), does it still
 * clear 4.5:1 on the `bg-hover` and `bg-pressed` rungs?
 *
 * It did not. Dark's convention was "hover goes lighter" (500 → 400 → 300), which is
 * right for surfaces — a raised plane is lighter — but wrong for a fill whose label
 * colour is fixed. Every intent in dark dropped its label to 2.45:1 on hover and
 * 1.89:1 on press, in both the reference theme and every consumer theme derived from
 * it. Found on 2026-07-28 while building the consumer-theme checker; confirmed in a
 * browser (a primary button in dark reads rgb(140,160,255) under the pointer).
 *
 * The fix moved dark's hover/pressed to the darker rungs (600 / 700). This checker is
 * what keeps them there.
 */
import { relativeLuminance, parseHex, contrast } from './contrast.ts';

const BODY_TEXT = 4.5;

type Node = { $value?: unknown; [k: string]: unknown };

export type IntentViolation = { theme: string; intent: string; state: string; detail: string };

/** Filled states share `fg`; soft states share `soft-fg`. Both must hold in every state. */
const FILLED = ['bg', 'bg-hover', 'bg-pressed'];
const SOFT = ['soft-bg', 'soft-bg-hover', 'soft-bg-pressed'];

/**
 * `disabled` is out of scope, and deliberately so. WCAG 2.2 SC 1.4.3 exempts text that
 * is part of an inactive control ("Incidental"), and state.md §7 says disabled is an
 * intent substitution rather than a dimming — the low contrast is the message. Every
 * other intent stays in.
 */
const EXEMPT = new Set(['disabled']);

function get(tree: Node, path: string): Node | undefined {
  let n: unknown = tree;
  for (const k of path.split('.')) {
    if (n == null || typeof n !== 'object') return undefined;
    n = (n as Node)[k];
  }
  return n as Node | undefined;
}

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

export function checkIntents(theme: string, themeTree: Node, base: Node): IntentViolation[] {
  const trees = [themeTree, base];
  const out: IntentViolation[] = [];
  const semantic = get(themeTree, 'color.semantic');
  if (!semantic) return out;

  for (const intent of Object.keys(semantic).filter((k) => !k.startsWith('$') && !EXEMPT.has(k))) {
    const group = get(themeTree, `color.semantic.${intent}`);
    if (!group || typeof group !== 'object') continue;

    for (const [fgKey, states] of [['fg', FILLED], ['soft-fg', SOFT]] as const) {
      const fgToken = get(group, fgKey);
      if (!fgToken || typeof fgToken.$value !== 'string') continue;
      const fg = parseHex(resolve(fgToken.$value, trees));

      for (const state of states) {
        const bgToken = get(group, state);
        if (!bgToken || typeof bgToken.$value !== 'string') continue;
        const bg = parseHex(resolve(bgToken.$value, trees));
        const c = contrast(fg, bg);
        if (c >= BODY_TEXT) continue;
        out.push({
          theme,
          intent,
          state,
          detail:
            `${intent}.${fgKey} on ${intent}.${state} is ${c.toFixed(2)}:1, ` +
            `below ${BODY_TEXT} (WCAG 2.2 SC 1.4.3). A state that only the pointer reaches is still text.`,
        });
      }
    }
  }
  return out;
}

export { relativeLuminance };
