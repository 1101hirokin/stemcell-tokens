// Custom Style Dictionary output formats for the stemcell/web platform.
import type StyleDictionary from 'style-dictionary';
import type { TransformedToken } from 'style-dictionary';

type NestedNode = string | { [key: string]: NestedNode };

function buildNestedObject(tokens: TransformedToken[]): Record<string, NestedNode> {
  const root: Record<string, NestedNode> = {};
  for (const token of tokens) {
    let current = root;
    const parts = [...token.path];
    const last = parts.pop()!;
    for (const part of parts) {
      if (typeof current[part] !== 'object') {
        current[part] = {} as Record<string, NestedNode>;
      }
      current = current[part] as Record<string, NestedNode>;
    }
    current[last] = `--${token.name}`;
  }
  return root;
}

function serializeValue(val: NestedNode, indent: number): string {
  const pad = ' '.repeat(indent);
  const pad2 = ' '.repeat(indent + 2);
  if (typeof val === 'string') return JSON.stringify(val);
  const entries = Object.entries(val);
  if (entries.length === 0) return '{}';
  const body = entries
    .map(([k, v]) => `${pad2}${/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k)}: ${serializeValue(v, indent + 2)}`)
    .join(',\n');
  return `{\n${body},\n${pad}}`;
}

function toCamelCase(s: string): string {
  return s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function registerFormats(sd: typeof StyleDictionary): void {
  // Outputs a TypeScript module where each top-level token group is a named
  // `as const` export whose leaf values are the CSS custom property names,
  // plus a flat `vars` export mapping CSS var names to resolved values.
  sd.registerFormat({
    name: 'stemcell/ts/css-var-names',
    format: ({ dictionary }) => {
      const nested = buildNestedObject(dictionary.allTokens);
      const exports = Object.entries(nested).map(([key, val]) => {
        const name = toCamelCase(key);
        return `export const ${name} = ${serializeValue(val, 0)} as const;`;
      });

      // In SD v5 DTCG mode, resolved value lives in $value (not value).
      const varEntries = dictionary.allTokens
        .map(t => `  ${JSON.stringify(`--${t.name}`)}: ${JSON.stringify(String((t as TransformedToken & { $value?: unknown }).$value ?? t.value))}`)
        .join(',\n');
      const varsExport = `export const vars = {\n${varEntries},\n} as const;`;

      return [...exports, varsExport].join('\n\n') + '\n';
    },
  });

  // Outputs dark-theme CSS with two selector blocks:
  // [data-theme="standard-dark"] for explicit opt-in, and
  // @media prefers-color-scheme:dark for OS-level auto-switching
  // (guarded so it won't override an explicit light theme attribute).
  sd.registerFormat({
    name: 'stemcell/css/dark-theme',
    format: ({ dictionary }) => {
      type DtcgToken = TransformedToken & { $value?: unknown; $description?: string };
      const lines = (dictionary.allTokens as DtcgToken[]).map(t => {
        const comment = t.$description ? ` /** ${t.$description} */` : '';
        const val = t.$value ?? t.value;
        return `  --${t.name}: ${val};${comment}`;
      });
      const body = lines.join('\n');
      const indentedBody = body.replace(/^/gm, '  ');

      return [
        '/**\n * Do not edit directly, this file was auto-generated.\n */',
        `[data-theme="standard-dark"] {\n${body}\n}`,
        `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {\n${indentedBody}\n  }\n}`,
      ].join('\n\n') + '\n';
    },
  });
}

/** Swift の識別子は数字で始まれない。段の番号には s を冠する（spacing.4 -> s4）。 */
function swiftIdent(seg: string, upper: boolean): string {
  const camel = seg.replace(/[-_.]([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  const safe = /^[0-9]/.test(camel) ? `s${camel}` : camel;
  return upper ? safe.charAt(0).toUpperCase() + safe.slice(1) : safe;
}

type SwiftNode = { leaf?: TransformedToken; children: Map<string, SwiftNode> };

function buildSwiftTree(tokens: TransformedToken[]): SwiftNode {
  const root: SwiftNode = { children: new Map() };
  for (const token of tokens) {
    let node = root;
    for (const part of token.path) {
      if (!node.children.has(part)) node.children.set(part, { children: new Map() });
      node = node.children.get(part)!;
    }
    node.leaf = token;
  }
  return root;
}

/** DTCG の型を Swift の型と、値の書き方へ写す。 */
/// この名前が宣言する不透明度。別名の先ではなく手前が持つ（elevation.md §6 の veil）。
function declaredAlpha(token: TransformedToken): number | undefined {
  type Ext = { $extensions?: { stemcell?: { alpha?: number } }; original?: Ext };
  const t = token as unknown as Ext;
  return t.$extensions?.stemcell?.alpha ?? t.original?.$extensions?.stemcell?.alpha;
}

function swiftValue(token: TransformedToken): { type: string; literal: string } | null {
  const t = (token as TransformedToken & { $type?: string }).$type ?? token.type;
  const v = String((token as TransformedToken & { $value?: unknown }).$value ?? token.value);
  switch (t) {
    case 'color': {
      if (!v.startsWith('.init(')) return null;
      // 不透明度は別名の先ではなく、この名前が宣言する。値変換の時点では別名がまだ
      // 解けておらず素通しするので（transforms.ts の「既知の穴」）、畳むのはここになる。
      // 見落とすと scrim が不透明のまま出る。実際そうなっていた。
      const alpha = declaredAlpha(token);
      const literal = alpha === undefined ? v : v.replace(/opacity: [0-9.]+/, `opacity: ${alpha}`);
      return { type: 'SwiftUI.Color', literal };
    }
    case 'duration':
      return { type: 'TimeInterval', literal: v };
    case 'dimension':
    case 'fontSize':
    case 'borderRadius':
    case 'strokeWidth':
    case 'breakpoint':
    case 'number':
    case 'fontWeight':
      return Number.isFinite(parseFloat(v)) && /^-?[0-9.]+$/.test(v)
        ? { type: 'CGFloat', literal: v }
        : null;
    case 'cubicBezier': {
      const pts = (token as TransformedToken & { $value?: unknown }).$value as number[];
      return Array.isArray(pts) && pts.length === 4
        ? { type: '(CGFloat, CGFloat, CGFloat, CGFloat)', literal: `(${pts.join(', ')})` }
        : null;
    }
    default:
      return null; // fontFamily / typography / strokeStyle は土地の写像が要る。§9
  }
}

function emitSwift(node: SwiftNode, name: string, indent: number, skipped: string[]): string[] {
  const pad = ' '.repeat(indent);
  const lines: string[] = [`${pad}public enum ${swiftIdent(name, true)} {`];
  for (const [key, child] of node.children) {
    if (child.leaf && child.children.size === 0) {
      const val = swiftValue(child.leaf);
      if (!val) { skipped.push(child.leaf.path.join('.')); continue; }
      lines.push(`${pad}    public static let ${swiftIdent(key, false)}: ${val.type} = ${val.literal}`);
    } else {
      lines.push(...emitSwift(child, key, indent + 4, skipped));
    }
  }
  lines.push(`${pad}}`);
  return lines;
}

export function registerSwiftFormats(sd: typeof StyleDictionary): void {
  sd.registerFormat({
    name: 'stemcell/swift/tokens',
    format: ({ dictionary, file }) => {
      const root = buildSwiftTree(dictionary.allTokens);
      const skipped: string[] = [];
      const enumName = (file.options as { enumName?: string } | undefined)?.enumName ?? 'StemcellTokens';
      const body: string[] = [];
      for (const [key, child] of root.children) {
        if (child.leaf && child.children.size === 0) {
          const val = swiftValue(child.leaf);
          if (!val) { skipped.push(child.leaf.path.join('.')); continue; }
          body.push(`    public static let ${swiftIdent(key, false)}: ${val.type} = ${val.literal}`);
        } else {
          body.push(...emitSwift(child, key, 4, skipped));
        }
      }
      const note = skipped.length
        ? `//\n// 出していないトークン（土地の写像が要る。DESIGN.md §9）:\n${skipped.map(s => `//   ${s}`).join('\n')}\n`
        : '';
      return [
        '// @stemcell/tokens が生成した。手で直さない。',
        '// 長さは pt。数は Web の CSS px と同じ値である（size.md §5）。',
        '// 時間は秒。SwiftUI の Animation が TimeInterval を取るため。',
        note.trimEnd(),
        '',
        'import CoreGraphics',
        'import SwiftUI',
        '',
        `public enum ${enumName} {`,
        ...body,
        '}',
        '',
      ].filter(l => l !== undefined).join('\n');
    },
  });
}
