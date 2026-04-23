import standardLight from "./theme/standard-light.json" with { type: "json" };
import standardDark from "./theme/standard-dark.json" with { type: "json" };
import type { StemcellTheme } from "./theme/theme-types.js";

export const themes = {
  "standard-light": standardLight as unknown as StemcellTheme,
  "standard-dark": standardDark as unknown as StemcellTheme,
} as const satisfies Record<string, StemcellTheme>;
