import standardLight from "./theme/standard-light.json" with { type: "json" };
import type { StemcellTheme } from "./theme/theme-types.js";

export type { StemcellTheme } from "./theme/theme-types.js";

export const themes: Record<string, StemcellTheme> = {
  "standard-light": standardLight as unknown as StemcellTheme,
};
