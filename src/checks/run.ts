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
import { checkFocusRing, type FocusRingViolation } from './focus-ring.ts';
import { checkCode, type CodeViolation } from './code.ts';
import { checkText, type TextViolation, type TextNote } from './text.ts';
import { checkIntents, type IntentViolation } from './intent.ts';
import { checkDataviz, type DatavizViolation, type DatavizNote } from './dataviz.ts';

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
const rings: FocusRingViolation[] = [];
const codes: CodeViolation[] = [];
const texts: TextViolation[] = [];
const textNotes: TextNote[] = [];
const intents: IntentViolation[] = [];
const dataviz: DatavizViolation[] = [];
const datavizNotes: DatavizNote[] = [];
for (const theme of ['standard-light', 'standard-dark']) {
  const tree = (await Bun.file(`src/theme/${theme}.json`).json()) as Dtcg;
  borders.push(...checkBorders(theme, tree as never, base as never, elevation as never));
  rings.push(...checkFocusRing(theme, tree as never, base as never, elevation as never));
  codes.push(...checkCode(theme, tree as never, base as never));
  const text = checkText(theme, tree as never, base as never);
  texts.push(...text.violations);
  textNotes.push(...text.notes);
  intents.push(...checkIntents(theme, tree as never, base as never));
  const dv = checkDataviz(theme, tree as never, base as never);
  dataviz.push(...dv.violations);
  datavizNotes.push(...dv.notes);
}

if (
  violations.length === 0 &&
  borders.length === 0 &&
  rings.length === 0 &&
  codes.length === 0 &&
  texts.length === 0 &&
  intents.length === 0 &&
  dataviz.length === 0
) {
  console.log(`palette: ${checked} scales, no violations`);
  console.log('border: every intent clears 3:1 on every elevation surface (WCAG 2.2 SC 1.4.11)');
  console.log('focus-ring: every ring clears 3:1, and the link clears 4.5:1, on every elevation surface');
  console.log('code: every syntax role clears 4.5:1 on the code surface (WCAG 2.2 SC 1.4.3)');
  console.log(
    'text: foreground and link clear 4.5:1 on every plane; fg-muted and fg-subtle clear it on the two that carry them',
  );
  console.log(
    'dataviz: categorical rungs clear 3:1 on the chart surface and stay apart under deuteranopia and protanopia;' +
      ' sequential moves further from the surface at every rung; diverging keeps its middle faintest',
  );
  console.log(
    'intent: every intent keeps its label at 4.5:1 on the fill and on the hover / pressed rungs, filled and soft',
  );
  for (const n of datavizNotes) {
    console.log(`  note: ${n.theme} / categorical rungs are at least ${n.min} apart in OKLab under ${n.kind}`);
  }
  for (const n of textNotes) {
    console.log(`  note: ${n.theme} / ${n.role} is ${n.ratio.toFixed(2)}:1 on the ${n.plane} plane (not enforced; color.md §11)`);
  }
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

if (dataviz.length) {
  console.error(`\ndataviz: ${dataviz.length} violations\n`);
  for (const v of dataviz) console.error(`  ${v.theme} / ${v.scale}\n    [${v.rule}] ${v.detail}`);
  console.error('\nfoundations/dataviz.md §3 makes these three promises about the chart palette.');
}

if (intents.length) {
  console.error(`\nintent: ${intents.length} violations\n`);
  for (const i of intents) console.error(`  ${i.theme} / ${i.intent}.${i.state}\n    ${i.detail}`);
  console.error(
    '\nA state that only the pointer reaches is still text (WCAG 2.2 SC 1.4.3).' +
      '\nDark moved hover / pressed to the darker rungs for this reason (2026-07-28).',
  );
}

if (rings.length) {
  console.error(`\nfocus-ring: ${rings.length} violations\n`);
  for (const r of rings) console.error(`  ${r.theme} / ${r.what}\n    ${r.detail}`);
  console.error(
    '\nThe ring sits on the page surface (2px offset), and a link is text that can sit on any surface.' +
      '\nSee foundations/focus-ring.md §6 in stemcell-component-prompts.',
  );
}

if (texts.length) {
  console.error(`\ntext: ${texts.length} violations of WCAG 2.2 SC 1.4.3\n`);
  for (const t of texts) console.error(`  ${t.theme} / ${t.role}\n    ${t.detail}`);
  console.error(
    '\nSecondary text is still text. Every plane a role sits on counts, not just the flat one.' +
      '\nSee foundations/color.md §6 in stemcell-component-prompts.',
  );
}

if (codes.length) {
  console.error(`\ncode: ${codes.length} violations of WCAG 2.2 SC 1.4.3\n`);
  for (const c of codes) console.error(`  ${c.theme} / ${c.role}\n    ${c.detail}`);
  console.error(
    '\nCode is body text. Syntax colours sit on color.app.surface and need 4.5:1 there.' +
      '\nSee foundations/color.md §10 in stemcell-component-prompts.',
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
