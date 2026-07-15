/**
 * Runs the palette constraint checker over every scale in the sources, and the
 * WCAG 2.2 SC 1.4.11 checker over every intent's border.
 *
 * Scales are discovered, not listed. A hard-coded list would silently stop
 * covering a hue the moment someone adds one, which is the failure mode this
 * check exists to prevent.
 *
 * The two checks look at different layers, and both are needed. The palette check
 * asks whether a scale is built correctly; the border check asks whether the right
 * rung of it was wired up. `border` aliasing `bg` passed the first and failed the
 * second at 1.19:1.
 */
import { checkScale, type Violation } from './contrast.ts';
import { checkBorders, type BorderViolation } from './border.ts';

const LADDER = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

type Dtcg = { $value?: unknown; [k: string]: unknown };

/** A group is a scale if it has the full 50…900 ladder of colour tokens under it. */
function findScales(node: Dtcg, path: string[] = []): Array<[string, Record<string, string>]> {
  const found: Array<[string, Record<string, string>]> = [];
  const keys = Object.keys(node).filter(k => !k.startsWith('$'));

  const isScale =
    keys.length > 0 &&
    LADDER.every(rung => {
      const child = node[rung] as Dtcg | undefined;
      return child != null && typeof child === 'object' && typeof child.$value === 'string';
    });

  if (isScale) {
    const shades: Record<string, string> = {};
    for (const rung of LADDER) shades[rung] = (node[rung] as Dtcg).$value as string;
    found.push([path.join('.'), shades]);
    return found;
  }

  for (const k of keys) {
    const child = node[k];
    if (child != null && typeof child === 'object') {
      found.push(...findScales(child as Dtcg, [...path, k]));
    }
  }
  return found;
}

const SOURCES = [
  'src/base.tokens.json',
  'src/theme/standard-light.json',
  'src/theme/standard-dark.json',
];

const violations: Violation[] = [];
let checked = 0;

for (const src of SOURCES) {
  const json = (await Bun.file(src).json()) as Dtcg;
  for (const [path, shades] of findScales(json)) {
    // A scale of aliases ({color.blue.500}) resolves to whatever it points at,
    // which is checked where it is defined. Only check literal scales.
    if (Object.values(shades).some(v => v.startsWith('{'))) continue;
    checked++;
    violations.push(...checkScale(`${path} (${src})`, shades));
  }
}

if (checked === 0) {
  console.error('No colour scales found. The discovery is broken, not the palette.');
  process.exit(1);
}

const base = (await Bun.file('src/base.tokens.json').json()) as Dtcg;
const elevation = (await Bun.file('src/elevation.tokens.json').json()) as Dtcg;
const borders: BorderViolation[] = [];
for (const theme of ['standard-light', 'standard-dark']) {
  const tree = (await Bun.file(`src/theme/${theme}.json`).json()) as Dtcg;
  borders.push(...checkBorders(theme, tree as never, base as never, elevation as never));
}

if (violations.length === 0 && borders.length === 0) {
  console.log(`palette: ${checked} scales, no violations`);
  console.log('border: every intent clears 3:1 on every elevation surface (WCAG 2.2 SC 1.4.11)');
  process.exit(0);
}

if (violations.length) {
  console.error(`palette: ${checked} scales, ${violations.length} violations\n`);
  for (const v of violations) console.error(`  ${v.hue}\n    [${v.rule}] ${v.detail}`);
  console.error(
    '\nThese are the promises color.md §3 makes about the primitive scales.' +
      '\nSee foundations/color.md in stemcell-component-prompts.',
  );
}

if (borders.length) {
  console.error(`\nborder: ${borders.length} violations of WCAG 2.2 SC 1.4.11\n`);
  for (const b of borders) console.error(`  ${b.theme} / ${b.intent}\n    ${b.detail}`);
  console.error(
    "\nA border is the boundary of a component, so it needs 3:1 against whatever it sits on." +
      '\nEvery elevation surface counts, not just the flat one.',
  );
}
process.exit(1);
