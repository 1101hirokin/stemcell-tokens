import { expect, test } from 'bun:test';
import { checkTheme, mergeBrand, defaultBrand } from './check-theme.ts';
import { defineTheme } from './define-theme.ts';

test('渡さなかった段は既定に落ちる', () => {
  const merged = mergeBrand({ brand: { '600': '#123456' } });
  expect(merged['600']).toBe('#123456');
  expect(merged['50']).toBe(defaultBrand()['50']);
});

test('既定のままなら違反は出ない', () => {
  const report = checkTheme({ colors: {} });
  expect(report.violations).toEqual([]);
});

test('部分指定は合成後の 10 段で測る(渡した段だけを見ない)', () => {
  const report = checkTheme({ colors: { brand: { '600': '#4f7cff' } }, scheme: 'light' });
  // 渡したのは 600 だけだが、既定の 100 との対で床を割ることが出る
  expect(report.violations.some((v) => v.where.includes('brand.100') && v.where.includes('brand.600'))).toBe(true);
  // 意味の役(面の上の文字)も測る
  expect(report.violations.some((v) => v.layer === 'role')).toBe(true);
});

test('scheme を省くと明暗の両方を測る', () => {
  const report = checkTheme({ colors: { brand: { '500': '#8CA0FF', '600': '#8CA0FF' } } });
  const schemes = new Set(report.violations.filter((v) => v.layer === 'role').map((v) => v.scheme));
  expect(schemes.has('light')).toBe(true);
  expect(schemes.has('dark')).toBe(true);
});

test('CSS は渡された段だけを宣言する(残りは既定のまま)', () => {
  const { css, dropped } = defineTheme({ key: 'acme', scheme: 'light', colors: { brand: { '600': '#5e4bde' } } });
  expect(css).toContain('[data-theme="acme"]');
  expect(css).toContain('color-scheme: light');
  expect(css).toContain('--color-brand-600: #5e4bde;');
  expect(css).not.toContain('--color-brand-500');
  expect(dropped).toEqual([]);
});

test('色として読めない値は落とす(CSS へ流さない)', () => {
  const { css, dropped } = defineTheme({
    key: 'acme',
    scheme: 'light',
    colors: { brand: { '600': 'red; } * { display: none' } },
  });
  expect(css).toBe('');
  expect(dropped[0]).toContain('brand.600');
});

test('知らない段と知らないキーは落とす', () => {
  const { dropped } = defineTheme({
    key: 'acme',
    scheme: 'dark',
    colors: { brand: { '650': '#000000' }, surface: { '500': '#fff' } } as never,
  });
  expect(dropped.some((d) => d.includes('brand.650'))).toBe(true);
  expect(dropped.some((d) => d.includes('surface'))).toBe(true);
});

test('テーマの名前は属性セレクタを閉じられない形だけ通す', () => {
  const { css, dropped } = defineTheme({ key: 'a"] * {color:red}', scheme: 'light', colors: {} });
  expect(css).toBe('');
  expect(dropped[0]).toContain('key');
});

test('図の分類の色を差し替えられる（テーマと同じ考え方）', () => {
  const { css, dropped } = defineTheme({
    key: 'acme',
    scheme: 'light',
    colors: { dataviz: { categorical: { '1': '#1B7F79', '2': '#C1440E' } } },
  });
  expect(css).toContain('--color-dataviz-categorical-1: #1B7F79;');
  expect(css).toContain('--color-dataviz-categorical-2: #C1440E;');
  expect(dropped).toEqual([]);
});

test('図の色も知らない段と読めない値は落とす', () => {
  const { css, dropped } = defineTheme({
    key: 'acme',
    scheme: 'light',
    colors: { dataviz: { categorical: { '9': '#000000', '1': 'red; } * { display: none' } as never } },
  });
  expect(css).toBe('');
  expect(dropped).toHaveLength(2);
});

test('連続と発散はまだ開けていない', () => {
  const { dropped } = defineTheme({
    key: 'acme',
    scheme: 'light',
    colors: { dataviz: { sequential: { '1': '#000000' } } as never },
  });
  expect(dropped.some((d) => d.startsWith('dataviz.sequential'))).toBe(true);
});

test('差し替えた分類の色を測る（既定との混ざり目も見る）', () => {
  // 2 を 1 と同じ色にすると、見分けが付かない
  const report = checkTheme({ scheme: 'light', colors: { dataviz: { categorical: { '2': '#1192E8' } } } });
  expect(report.violations.some((v) => v.layer === 'dataviz' && v.where.includes('↔'))).toBe(true);
});

test('既定の分類の色は自分の床を満たす', () => {
  for (const scheme of ['light', 'dark'] as const) {
    const report = checkTheme({ scheme, colors: {} });
    expect(report.violations.filter((v) => v.layer === 'dataviz')).toEqual([]);
  }
});
