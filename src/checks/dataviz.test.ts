import { expect, test } from 'bun:test';
import { checkDataviz, distance, oklab } from './dataviz.ts';
import base from '../base.tokens.json' with { type: 'json' };
import light from '../theme/standard-light.json' with { type: 'json' };
import dark from '../theme/standard-dark.json' with { type: 'json' };

const themes = [['standard-light', light], ['standard-dark', dark]] as const;

test('参照のテーマは三つの約束を満たす', () => {
  for (const [name, tree] of themes) {
    const { violations } = checkDataviz(name, tree as never, base as never);
    expect(violations).toEqual([]);
  }
});

test('分類の色の隔たりを測って印字する(色覚の型ごと)', () => {
  const { notes } = checkDataviz('standard-light', light as never, base as never);
  expect(notes.map((n) => n.kind).sort()).toEqual(['deuteranopia', 'normal', 'protanopia']);
  expect(notes.find((n) => n.kind === 'normal')!.min).toBeGreaterThan(0.1);
});

test('近すぎる二色は捕まえる', () => {
  const broken = structuredClone(light) as Record<string, never>;
  const dv = (broken as never as { color: { dataviz: { categorical: Record<string, { $value: string }> } } }).color.dataviz
    .categorical;
  dv['2']!.$value = dv['1']!.$value; // 同じ色を二つ置く
  const { violations } = checkDataviz('standard-light', broken as never, base as never);
  expect(violations.some((v) => v.rule.startsWith('distinct-'))).toBe(true);
});

test('地に紛れる色は捕まえる(SC 1.4.11)', () => {
  const broken = structuredClone(light) as never as {
    color: { dataviz: { categorical: Record<string, { $value: string }> } };
  };
  broken.color.dataviz.categorical['1']!.$value = '#fefefe';
  const { violations } = checkDataviz('standard-light', broken as never, base as never);
  expect(violations.some((v) => v.rule === 'graphic-3to1')).toBe(true);
});

test('連続の段が地へ戻ったら捕まえる', () => {
  const broken = structuredClone(light) as never as {
    color: { dataviz: { sequential: Record<string, { $value: string }> } };
  };
  broken.color.dataviz.sequential['5']!.$value = '{color.blue.100}';
  const { violations } = checkDataviz('standard-light', broken as never, base as never);
  expect(violations.some((v) => v.rule === 'monotone')).toBe(true);
});

test('発散の中心が目立つと捕まえる', () => {
  const broken = structuredClone(light) as never as {
    color: { dataviz: { diverging: Record<string, { $value: string }> } };
  };
  broken.color.dataviz.diverging['4']!.$value = '{color.gray.900}';
  const { violations } = checkDataviz('standard-light', broken as never, base as never);
  expect(violations.some((v) => v.rule === 'faint-middle')).toBe(true);
});

test('OKLab の距離は同じ色で 0 になる', () => {
  expect(distance([18, 99, 225], [18, 99, 225])).toBe(0);
  expect(oklab([255, 255, 255])[0]).toBeCloseTo(1, 2);
});
