/** 消費者のテーマを扱う道具（測る／CSS へ変える）。実行時のゲートではない。 */
export { checkTheme, mergeBrand, defaultBrand, RUNGS } from './check-theme.ts';
export type { ThemeColors, ThemeInput, ThemeReport, ThemeViolation, Rung, Scheme } from './check-theme.ts';
export { defineTheme } from './define-theme.ts';
export type { ThemeDefinition, DefineResult } from './define-theme.ts';
