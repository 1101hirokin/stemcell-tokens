#!/usr/bin/env node
/**
 * `stemcell-theme check [file]`
 *
 * 消費者のプロジェクトから回す検査。合格したら一行、落ちたときだけ詳しく喋る。
 * 終了コードは 0 合格 / 1 違反 / 2 使い方の誤り。--warn-only で 1 を 0 に落とす。
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve as resolvePath } from 'node:path';
import { checkTheme, type Scheme, type ThemeInput } from './check-theme.ts';

const HELP = `stemcell-theme check [file]

  file        テーマの定義（.json / .js / .ts、既定エクスポート）。省くと
              stemcell.theme.json → package.json の stemcell.theme の順で探す。
              - を渡すと標準入力から読む。

  --scheme    light か dark。省くと両方を測る。
  --json      機械向けの出力。
  --warn-only 違反があっても 0 で終わる。
  --verbose   合格した検査の数も出す。
`;

type Args = { file?: string; scheme?: Scheme; json: boolean; warnOnly: boolean; verbose: boolean };

function parse(argv: string[]): Args | 'help' {
  const a: Args = { json: false, warnOnly: false, verbose: false };
  const rest = argv.filter((x) => x !== 'check');
  for (let i = 0; i < rest.length; i++) {
    const x = rest[i]!;
    if (x === '--help' || x === '-h') return 'help';
    else if (x === '--json') a.json = true;
    else if (x === '--warn-only') a.warnOnly = true;
    else if (x === '--verbose') a.verbose = true;
    else if (x === '--scheme') a.scheme = rest[++i] as Scheme;
    else if (!x.startsWith('-') || x === '-') a.file = x;
  }
  return a;
}

async function load(file: string | undefined): Promise<{ input: ThemeInput; from: string }> {
  if (file === '-') {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    return { input: JSON.parse(Buffer.concat(chunks).toString('utf8')), from: '標準入力' };
  }
  const candidates = file ? [file] : ['stemcell.theme.json', 'stemcell.theme.js', 'stemcell.theme.ts'];
  for (const c of candidates) {
    if (!existsSync(c)) continue;
    if (c.endsWith('.json')) return { input: JSON.parse(await readFile(c, 'utf8')), from: c };
    const mod = (await import(pathToFileURL(resolvePath(c)).href)) as { default?: ThemeInput };
    if (!mod.default) throw new Error(`${c} が既定エクスポートを持っていない`);
    return { input: mod.default, from: c };
  }
  if (!file && existsSync('package.json')) {
    const json = JSON.parse(await readFile('package.json', 'utf8')) as { stemcell?: { theme?: string } };
    if (json.stemcell?.theme) return load(json.stemcell.theme);
  }
  throw new Error(
    file
      ? `${file} が読めない`
      : 'テーマが見つからない。stemcell.theme.json を置くか、package.json の stemcell.theme に場所を書くか、引数で渡す',
  );
}

const args = parse(process.argv.slice(2));
if (args === 'help') {
  console.log(HELP);
  process.exit(0);
}

let loaded;
try {
  loaded = await load(args.file);
} catch (e) {
  console.error(`stemcell-theme: ${(e as Error).message}`);
  process.exit(2);
}

const input = loaded.input;
if (!input || typeof input !== 'object' || !input.colors) {
  console.error('stemcell-theme: テーマの形が違う。{ scheme?, colors: { brand: { "600": "#…" } } } を渡す');
  process.exit(2);
}

const report = checkTheme({ ...input, scheme: args.scheme ?? input.scheme });

if (args.json) {
  console.log(JSON.stringify(report, null, 2));
} else if (report.violations.length === 0) {
  console.log(
    `stemcell-theme  ${loaded.from}: 違反なし（合成後の 10 段・${args.scheme ?? input.scheme ?? 'light/dark'}）` +
      (args.verbose ? `。検査 ${report.checked} 件` : ''),
  );
} else {
  console.log(`stemcell-theme  ${loaded.from} を検査（合成後の 10 段）\n`);
  for (const v of report.violations) {
    const floor = v.floor ? `床 ${v.floor}` : v.rule;
    console.log(`  ✗ ${v.scheme.padEnd(5)} ${v.where}  ${v.ratio}:1  (${floor})`);
    console.log(`    ${v.hint}\n`);
  }
  console.log(
    `${report.violations.length} 件` + (args.verbose ? `。検査 ${report.checked} 件` : '（--verbose で検査の数も出す）'),
  );
}

process.exit(report.violations.length && !args.warnOnly ? 1 : 0);
