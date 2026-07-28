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
