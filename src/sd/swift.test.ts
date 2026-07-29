/**
 * 生成した Swift を、Swift 無しで検める。
 *
 * この作業機に Swift のツールチェーンが無いので、コンパイルで確かめられない。代わりに、
 * コンパイラが落とすはずのもの（識別子の綴り、同じ場所での重複、括弧の対応）と、コンパイラでは
 * 気づけないもの（CSS には在るのに Swift から消えたトークン）を測る。
 *
 * 二つ目のほうが大事である。format が型を写せずに黙って落とすと、Swift は問題なく通るのに
 * 実装が値を引けない。落とすなら宣言して落とす、が要求である。
 */
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(import.meta.dir, '../../Sources/StemcellTokens');
const FILES = ['Base.swift', 'StandardLight.swift', 'StandardDark.swift'];

const read = (f: string) => readFileSync(join(DIR, f), 'utf-8');

/** Swift の識別子。先頭は英字か下線で、以降は英数字と下線。 */
const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

describe('生成した Swift', () => {
  for (const file of FILES) {
    describe(file, () => {
      const src = read(file);

      test('宣言した名前がすべて Swift の識別子として通る', () => {
        const bad: string[] = [];
        for (const m of src.matchAll(/public (?:enum|static let) ([^ :{]+)/g)) {
          if (!IDENT.test(m[1]!)) bad.push(m[1]!);
        }
        expect(bad, `識別子にならない名前: ${bad.join(', ')}`).toEqual([]);
      });

      test('括弧が対応する', () => {
        const open = (src.match(/\{/g) ?? []).length;
        const close = (src.match(/\}/g) ?? []).length;
        expect(open).toBe(close);
      });

      test('同じ入れ子の中で名前が重ならない', () => {
        const stack: Set<string>[] = [new Set()];
        for (const line of src.split('\n')) {
          const decl = /public (?:enum|static let) ([^ :{]+)/.exec(line);
          if (decl) {
            const scope = stack[stack.length - 1]!;
            expect(scope.has(decl[1]!), `${decl[1]} が同じ入れ子に二度ある`).toBe(false);
            scope.add(decl[1]!);
          }
          if (line.includes('{')) stack.push(new Set());
          if (line.includes('}')) stack.pop();
        }
      });

      test('色は sRGB の成分で書かれ、成分が 0 から 1 に収まる', () => {
        for (const m of src.matchAll(/red: ([\d.]+), green: ([\d.]+), blue: ([\d.]+), opacity: ([\d.]+)/g)) {
          for (const raw of m.slice(1)) {
            const n = Number(raw);
            expect(n).toBeGreaterThanOrEqual(0);
            expect(n).toBeLessThanOrEqual(1);
          }
        }
      });
    });
  }

  for (const file of ['StandardLight.swift', 'StandardDark.swift']) {
    test(`${file} の veil と影が宣言した不透明度を持つ`, () => {
      // 不透明度は別名の先ではなくこの名前が持つ（elevation.md §6）。値変換の時点では
      // 別名がまだ解けていないので、畳むのは書式の側になる。ここを見落として scrim が
      // 不透明のまま出ていたことがある。数を固定して二度目を防ぐ。
      const src = read(file);
      const opacities = (name: string) =>
        [...src.matchAll(new RegExp(`let ${name}: SwiftUI\\.Color = \\.init\\([^)]*opacity: ([\\d.]+)`, 'g'))]
          .map(m => Number(m[1]));

      // scrim は二つ出る。Color.App のほうは veil の基底色で不透明のまま、
      // 外側の veil が 0.4 を持つ。どちらも要るので、両方あることを見る。
      expect(opacities('scrim').sort()).toEqual([0.4, 1]);
      for (const n of [...opacities('shadowUmbra'), ...opacities('shadowPenumbra')]) {
        expect(n).toBeLessThan(1);
        expect(n).toBeGreaterThan(0);
      }
    });
  }

  test('時間は秒である', () => {
    const src = read('Base.swift');
    const values = [...src.matchAll(/: TimeInterval = ([\d.]+)/g)].map(m => Number(m[1]));
    expect(values.length).toBeGreaterThan(0);
    // ms のまま出ていれば 70 のような値になる。動きの意味層でいちばん長いのは 700ms なので、
    // 1 秒を超えたらミリ秒のまま出ている疑いがある。
    for (const v of values) expect(v).toBeLessThan(1);
  });

  test('長さは Web と同じ数である（rem へ寄せない）', () => {
    const swift = read('Base.swift');
    const css = readFileSync(join(import.meta.dir, '../../dist/web/base.css'), 'utf-8');
    // spacing の原始は Web で rem、Swift で pt。16px = 1rem = 16pt。
    const rem = /--spacing-4:\s*([\d.]+)rem/.exec(css);
    const pt = /public static let s4: CGFloat = ([\d.]+)/.exec(swift.slice(swift.indexOf('enum Spacing')));
    expect(rem, 'CSS に --spacing-4 が無い').not.toBeNull();
    expect(pt, 'Swift に Spacing.s4 が無い').not.toBeNull();
    expect(Number(pt![1]) / 16).toBeCloseTo(Number(rem![1]), 5);
  });

  test('CSS に在る色が Swift から黙って消えていない', () => {
    for (const [swiftFile, cssFile] of [
      ['StandardLight.swift', 'standard-light.css'],
      ['StandardDark.swift', 'standard-dark.css'],
    ] as const) {
      const css = readFileSync(join(import.meta.dir, '../../dist/web', cssFile), 'utf-8');
      const cssNames = new Set([...css.matchAll(/--(color-[a-z0-9-]+):/g)].map(m => m[1]!));

      // Swift は入れ子なので、宣言の道を辿って CSS の名前へ戻す。
      const swiftNames = new Set<string>();
      const stack: string[] = [];
      for (const line of read(swiftFile).split('\n')) {
        const e = /public enum (\w+)/.exec(line);
        const l = /public static let (\w+): SwiftUI\.Color/.exec(line);
        if (e) stack.push(e[1]!);
        else if (l) {
          const path = [...stack.slice(1), l[1]!];
          // 段の番号は Swift の識別子にするとき s を冠している（s1 / s50）。名前へ戻すときは外す。
          swiftNames.add(
            path
              .map(p => p.replace(/^s(\d+)$/, '$1').replace(/([a-z0-9])([A-Z])/g, '$1-$2'))
              .join('-')
              .toLowerCase(),
          );
        }
        if (line.trim() === '}') stack.pop();
      }

      const missing = [...cssNames].filter(n => !swiftNames.has(n));
      expect(missing, `${cssFile} に在って ${swiftFile} に無い: ${missing.join(', ')}`).toEqual([]);
    }
  });
});
