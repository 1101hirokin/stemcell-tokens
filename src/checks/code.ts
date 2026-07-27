/**
 * WCAG 2.2 SC 1.4.3 for the syntax colours.
 *
 * `color.code.*` paints code, and code is body text. Every role therefore needs 4.5:1
 * against the surface the block sits on, in both themes. That surface is fixed to
 * `color.app.surface` by color.md §10 — a code block that an app puts somewhere else
 * is the app's call, and this check makes no promise about it.
 *
 * This exists because syntax themes are where contrast quietly dies. The popular ones
 * are authored for a particular editor background and then reused on another; comments
 * are the usual casualty, being the one role everybody makes faint on purpose. Wiring
 * the roles to the palette rungs is not enough on its own either: dark's 400 rung
 * measures 4.2:1 against the dark surface, which looks fine in isolation and fails.
 *
 * The roles are discovered, not listed. Adding a seventh role to color.md means the
 * seventh role is checked, with no edit here.
 */
import { parseHex, contrast } from './contrast.ts';

const BODY_TEXT = 4.5;

type Node = { $value?: unknown; $description?: string; [k: string]: unknown };

export type CodeViolation = { theme: string; role: string; detail: string };

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

export function checkCode(theme: string, themeTree: Node, base: Node): CodeViolation[] {
  const trees = [themeTree, base];
  const out: CodeViolation[] = [];

  const code = get(themeTree, 'color.code');
  if (!code) return out;

  const surfaceToken = get(themeTree, 'color.app.surface');
  if (!surfaceToken || typeof surfaceToken.$value !== 'string') {
    throw new Error(`${theme}: color.app.surface is missing. Code colours are calibrated against it.`);
  }
  const surface = resolve(surfaceToken.$value, trees);

  let roles = 0;
  for (const [role, node] of Object.entries(code)) {
    if (role.startsWith('$')) continue;
    const token = node as Node;
    if (typeof token.$value !== 'string') continue;
    roles++;
    const c = contrast(parseHex(resolve(token.$value, trees)), parseHex(surface));
    if (c < BODY_TEXT) {
      out.push({
        theme,
        role,
        detail:
          `code.${role} is ${c.toFixed(2)}:1 against app.surface (${surface}), ` +
          `below ${BODY_TEXT} (WCAG 2.2 SC 1.4.3 — code is body text)`,
      });
    }
  }
  if (roles === 0) throw new Error(`${theme}: color.code exists but has no roles. The discovery is broken.`);

  return out;
}
