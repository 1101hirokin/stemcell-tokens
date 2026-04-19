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
        `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="standard-light"]) {\n${indentedBody}\n  }\n}`,
      ].join('\n\n') + '\n';
    },
  });
}
