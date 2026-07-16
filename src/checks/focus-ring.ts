/**
 * The focus ring's 3:1, and the link's 4.5:1, against every elevation surface.
 *
 * focus-ring.md has promised this check since the foundation was written ("コントラストは
 * color と同じく CI で機械強制する") and it did not exist — the same specified-but-absent
 * hole as the density auto-switch. When it was finally measured, the dark ring cleared 3:1
 * on one of the four dark surfaces, and the link — which shares `app.system` with the
 * ring — failed AA as text in both themes (4.02:1 on white; 1.76:1 on the dark modal).
 *
 * What each threshold is:
 *
 *   ring  3:1  WCAG 2.2 SC 1.4.11 (non-text). Measured against the elevation surfaces
 *              only, not against the component's own bg: the ring is drawn with a 2px
 *              outline-offset, so the pixels next to it on both sides are the page
 *              surface (focus-ring.md §4's stated design). A ring-vs-bg requirement is
 *              also unsatisfiable — clearing 3:1 against both a white page and a
 *              600-rung bg needs a luminance inside [0.298, 0.300].
 *   link  4.5  WCAG 2.2 SC 1.4.3 (text). A link is body text and can sit on any surface.
 *
 * `foreground` / `fg-muted` / `fg-subtle` are NOT checked yet. Dark's modal surface only
 * leaves rungs 50 and 100 above 4.5:1, so a three-step text hierarchy cannot exist on it —
 * the same squeeze that capped the surfaces at four (color.md §6). Which roles are allowed
 * on which surfaces is a design decision, and a gate that is red forever teaches people to
 * ignore it. Recorded in color.md's TODO instead.
 */
import { parseHex, contrast, type Rgb } from './contrast.ts';

const RING = 3.0;
const TEXT_AA = 4.5;

type Node = { $value?: unknown; [k: string]: unknown };

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

export type FocusRingViolation = { theme: string; what: string; surface: string; detail: string };

export function checkFocusRing(
  theme: string,
  themeTree: Node,
  base: Node,
  elevation: Node,
): FocusRingViolation[] {
  const trees = [themeTree, base, elevation];
  const out: FocusRingViolation[] = [];

  const elev = get(elevation, 'elevation') ?? {};
  const surfaces = new Map<string, Rgb>();
  for (const [name, node] of Object.entries(elev)) {
    if (name.startsWith('$')) continue;
    const s = (node as Node)['surface'] as Node | undefined;
    if (s && typeof s.$value === 'string') surfaces.set(name, parseHex(resolve(s.$value, trees)));
  }
  if (surfaces.size === 0) throw new Error(`${theme}: found no elevation surfaces.`);

  const measure = (what: string, colour: Rgb, floor: number, sc: string) => {
    for (const [name, surface] of surfaces) {
      const c = contrast(colour, surface);
      if (c < floor) {
        out.push({
          theme,
          what,
          surface: name,
          detail: `${what} is ${c.toFixed(2)}:1 against the ${name} surface, below ${floor} (${sc})`,
        });
      }
    }
  };

  // Every intent's ring. They all alias one token today, but the structure allows them to
  // diverge (focus-ring.md §4: "色は intent ごとに定める"), so measure each.
  const semantic = get(themeTree, 'color.semantic') ?? {};
  for (const [intent, node] of Object.entries(semantic)) {
    if (intent.startsWith('$')) continue;
    const ring = (node as Node)['focus-ring'] as Node | undefined;
    if (!ring || typeof ring.$value !== 'string') continue;
    measure(`${intent}'s focus-ring`, parseHex(resolve(ring.$value, trees)), RING, 'WCAG 2.2 SC 1.4.11');
  }

  const link = get(themeTree, 'color.app.link');
  if (link && typeof link.$value === 'string') {
    measure('app.link', parseHex(resolve(link.$value, trees)), TEXT_AA, 'WCAG 2.2 SC 1.4.3, link is text');
  }

  return out;
}
