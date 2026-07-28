/**
 * 消費者が渡したテーマを CSS へ変える。
 *
 * ここが DS の外にある文字列を CSS へ流す唯一の場所である。多くのアプリでブランドの色はビルド時の
 * 定数だが、テナントごとに色を選ばせる作りだと、その値は最終的に利用者由来の文字列になる。
 * `#5e4bde` のつもりの場所に `red; } * { display: none` が入れば画面が消える。だからキーの検証と
 * 値の検証はここが握る（各実装が再発明しない。StemcellProvider.md §7）。
 *
 * 測ることはしない（裁定 2026-07-28）。規約を満たすかは消費者の責任で、測りたい消費者は
 * `checkTheme` を自分の CI で回す。ここは「安全な CSS を作る」ことだけを担う。
 */
import { RUNGS, type Rung, type Scheme, type ThemeColors } from './check-theme.ts';

export type ThemeDefinition = {
  /** テーマの名前。data-theme の値になる。 */
  key: string;
  scheme: Scheme;
  colors: ThemeColors;
};

export type DefineResult = {
  /** そのまま <style> へ入れられる文字列。渡さなかった段は既定に落ちる（宣言しない）。 */
  css: string;
  /** 落とした指定（知らないキー、形が違う値）。開発中に気づけるように返す。 */
  dropped: string[];
};

/** 色として通す形だけを受ける。関数記法（var / url / 式）は通さない。 */
const COLOR = /^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\([0-9a-zA-Z%.,\/\s+-]*\))$/;
/** data-theme の値に使える形（属性セレクタを閉じられない文字だけ）。 */
const KEY = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

export function defineTheme(theme: ThemeDefinition): DefineResult {
  const dropped: string[] = [];
  if (!KEY.test(theme.key)) {
    return { css: '', dropped: [`key: ${JSON.stringify(theme.key)} は使えない（英字で始まり、英数字と - と _ だけ）`] };
  }
  if (theme.scheme !== 'light' && theme.scheme !== 'dark') {
    return { css: '', dropped: [`scheme: ${JSON.stringify(theme.scheme)} は light か dark のどちらか`] };
  }

  const decls: string[] = [];
  for (const [name, value] of Object.entries(theme.colors.brand ?? {})) {
    if (!RUNGS.includes(name as Rung)) {
      dropped.push(`brand.${name}: 知らない段（使えるのは ${RUNGS.join(' / ')}）`);
      continue;
    }
    if (typeof value !== 'string' || !COLOR.test(value.trim())) {
      dropped.push(`brand.${name}: ${JSON.stringify(value)} は色として読めない`);
      continue;
    }
    decls.push(`  --color-brand-${name}: ${value.trim()};`);
  }
  for (const key of Object.keys(theme.colors)) {
    if (key !== 'brand') dropped.push(`${key}: いま開いているのは brand だけである（StemcellProvider.md §7）`);
  }

  const css = decls.length
    ? `[data-theme="${theme.key}"] {\n  color-scheme: ${theme.scheme};\n${decls.join('\n')}\n}\n`
    : '';
  return { css, dropped };
}
