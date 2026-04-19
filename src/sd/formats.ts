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
  // `as const` export whose leaf values are the CSS custom property names.
  sd.registerFormat({
    name: 'stemcell/ts/css-var-names',
    format: ({ dictionary }) => {
      const nested = buildNestedObject(dictionary.allTokens);
      const exports = Object.entries(nested).map(([key, val]) => {
        const name = toCamelCase(key);
        return `export const ${name} = ${serializeValue(val, 0)} as const;`;
      });
      return exports.join('\n\n') + '\n';
    },
  });
}
