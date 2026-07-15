/**
 * Runs the palette constraint checker over every scale in the sources.
 *
 * Scales are discovered, not listed. A hard-coded list would silently stop
 * covering a hue the moment someone adds one, which is the failure mode this
 * check exists to prevent.
 */
import { checkScale, type Violation } from './contrast.ts';

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

if (violations.length === 0) {
  console.log(`palette: ${checked} scales, no violations`);
  process.exit(0);
}

console.error(`palette: ${checked} scales, ${violations.length} violations\n`);
for (const v of violations) console.error(`  ${v.hue}\n    [${v.rule}] ${v.detail}`);
console.error(
  '\nThese are the promises color.md §3 makes about the primitive scales.' +
    '\nSee foundations/color.md in stemcell-component-prompts.',
);
process.exit(1);
