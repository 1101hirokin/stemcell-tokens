/**
 * WCAG 1.4.11 for component boundaries.
 *
 * `border` is the outline `outlined` draws (emphasis.md), so it is the boundary of a
 * user interface component, and 1.4.11 Non-text Contrast asks for 3:1 against what is
 * behind it. What is behind it is whatever elevation surface the component sits on, and
 * dark has four distinct ones (#292F36 through #526071). Clearing 3:1 on the flat
 * surface says nothing about the modal.
 *
 * This exists because `border` used to alias `bg`, and nothing noticed. `bg` is 500 in
 * dark so that white text clears AA on it — a different question from being visible
 * against the ground. It measured 2.51:1 on flat and 1.19:1 on modal. The palette
 * checker did not catch it: every scale was internally fine. The fault was in the
 * wiring, one layer up.
 *
 * `disabled` is exempt. 1.4.11 excludes inactive components, and raising a disabled
 * outline to 3:1 would defeat what disabled is for.
 */
import { relativeLuminance, parseHex, contrast } from './contrast.ts';

const NON_TEXT = 3.0;

type Node = { $value?: unknown; $description?: string; [k: string]: unknown };

/** 1.4.11 excludes inactive components. */
const EXEMPT = new Set(['disabled']);

export type BorderViolation = { theme: string; intent: string; surface: string; detail: string };

function get(tree: Node, path: string): Node | undefined {
  let n: unknown = tree;
  for (const k of path.split('.')) {
    if (n == null || typeof n !== 'object') return undefined;
    n = (n as Node)[k];
  }
  return n as Node | undefined;
}

/** Follows `{a.b.c}` aliases through the given trees until a literal falls out. */
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

export function checkBorders(
  theme: string,
  themeTree: Node,
  base: Node,
  elevation: Node,
): BorderViolation[] {
  const trees = [themeTree, base, elevation];
  const out: BorderViolation[] = [];

  const elev = get(elevation, 'elevation') ?? {};
  const surfaces = new Map<string, string>();
  for (const [name, node] of Object.entries(elev)) {
    if (name.startsWith('$')) continue;
    const s = (node as Node)['surface'] as Node | undefined;
    if (s && typeof s.$value === 'string') surfaces.set(name, resolve(s.$value, trees));
  }
  if (surfaces.size === 0) throw new Error(`${theme}: found no elevation surfaces. The discovery is broken.`);

  const semantic = get(themeTree, 'color.semantic') ?? {};
  for (const [intent, node] of Object.entries(semantic)) {
    if (intent.startsWith('$') || EXEMPT.has(intent)) continue;
    const border = (node as Node)['border'] as Node | undefined;
    if (!border || typeof border.$value !== 'string') continue;
    const colour = parseHex(resolve(border.$value, trees));

    for (const [name, surface] of surfaces) {
      const c = contrast(colour, parseHex(surface));
      if (c < NON_TEXT) {
        out.push({
          theme,
          intent,
          surface: name,
          detail:
            `border is ${c.toFixed(2)}:1 against the ${name} surface (${surface}), ` +
            `below ${NON_TEXT} (WCAG 1.4.11 Non-text Contrast)`,
        });
      }
    }
  }
  return out;
}

export { relativeLuminance };
