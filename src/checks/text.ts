/**
 * WCAG 2.2 SC 1.4.3 for the text colours of the app layer.
 *
 * `border` got this treatment first (border.ts): a role is not calibrated until you ask
 * it against every plane it can sit on, because dark's planes are four different greys.
 * Text had never been asked. It should have been asked first — text is the stricter of
 * the two floors (4.5:1 rather than 3:1) and there is far more of it.
 *
 * What it found on 2026-07-27, before this file existed: dark's `fg-subtle` still held the
 * light theme's value and measured 2.52:1 against the darkest plane, failing everywhere,
 * and `fg-muted` measured 4.20:1 on the surface plane — the plane every card and table
 * uses. Both were invisible to the palette checker, which only asks whether a scale is
 * built correctly, not which rung got wired to which role.
 *
 * Scope, and why it is not simply "every plane":
 *
 *   `foreground` and `link` are checked on all four planes. They pass.
 *
 *   `fg-muted` and `fg-subtle` are checked on the ground and the surface — the two planes
 *   that carry secondary text in practice (page body, cards, tables, lists). Dark's planes
 *   climb to gray.600, and on that lightest plane no rung except 50/100 clears 4.5:1;
 *   wiring the muted roles there would collapse them into the foreground and leave the
 *   hierarchy with nothing to say. That residue belongs to the palette-wide re-author
 *   (color.md §11), not to a checker that would have to be satisfied by making three roles
 *   the same colour. The measurements for the remaining planes are printed, not enforced,
 *   so the gap stays visible rather than becoming folklore.
 */
import { relativeLuminance, parseHex, contrast } from './contrast.ts';

const BODY_TEXT = 4.5;

type Node = { $value?: unknown; $description?: string; [k: string]: unknown };

export type TextViolation = { theme: string; role: string; plane: string; detail: string };
export type TextNote = { theme: string; role: string; plane: string; ratio: number };

/** Planes every text role must clear, and the ones only the primary roles must. */
const CARRIES_SECONDARY_TEXT = ['background', 'surface'];
const ALL_PLANES = ['background', 'surface', 'surface-raised', 'overlay'];
const PRIMARY_ROLES = ['foreground', 'link'];
const SECONDARY_ROLES = ['fg-muted', 'fg-subtle'];

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

export function checkText(
  theme: string,
  themeTree: Node,
  base: Node,
): { violations: TextViolation[]; notes: TextNote[] } {
  const trees = [themeTree, base];
  const violations: TextViolation[] = [];
  const notes: TextNote[] = [];

  const plane = (name: string) => {
    const token = get(themeTree, `color.app.${name}`);
    if (!token || typeof token.$value !== 'string') {
      throw new Error(`${theme}: color.app.${name} is missing. Text is calibrated against it.`);
    }
    return resolve(token.$value, trees);
  };
  const planes = Object.fromEntries(ALL_PLANES.map((p) => [p, plane(p)]));

  const measure = (role: string, enforcedOn: string[]) => {
    const token = get(themeTree, `color.app.${role}`);
    if (!token || typeof token.$value !== 'string') return;
    const colour = parseHex(resolve(token.$value, trees));
    for (const [name, ground] of Object.entries(planes)) {
      const c = contrast(colour, parseHex(ground));
      if (enforcedOn.includes(name)) {
        if (c < BODY_TEXT) {
          violations.push({
            theme,
            role,
            plane: name,
            detail:
              `${role} is ${c.toFixed(2)}:1 on the ${name} plane (${ground}), ` +
              `below ${BODY_TEXT} (WCAG 2.2 SC 1.4.3)`,
          });
        }
      } else if (c < BODY_TEXT) {
        notes.push({ theme, role, plane: name, ratio: c });
      }
    }
  };

  for (const role of PRIMARY_ROLES) measure(role, ALL_PLANES);
  for (const role of SECONDARY_ROLES) measure(role, CARRIES_SECONDARY_TEXT);

  return { violations, notes };
}

export { relativeLuminance };
