export type StemcellDtcgToken<TType extends string, TValue> = {
    $value: TValue;
    $type: TType;
    $description?: string;
};

export type StemcellColorToken = StemcellDtcgToken<"color", string>;

export type StemcellShadowLayer = {
    color: string;
    offsetX: string;
    offsetY: string;
    blur: string;
    spread?: string;
    inset?: boolean;
};

/** An empty layer list means "casts nothing" and emits `none`. */
export type StemcellShadowToken = StemcellDtcgToken<"shadow", StemcellShadowLayer[]>;

/**
 * One elevation level, expressed as the two facets a theme swaps: the surface
 * colour and the shadow. Light tints nothing and casts shadows; dark lightens the
 * surface and casts none. Components read both facets and never branch on theme.
 */
export type StemcellElevationLevel = Partial<{
    surface: StemcellColorToken;
    shadow: StemcellShadowToken;
}>;

/**
 * The level set is normative: themes choose how a level is drawn, never which
 * levels exist or what order they sit in.
 */
export type StemcellElevationTokens = Partial<{
    flat: StemcellElevationLevel;
    surface: StemcellElevationLevel;
    navigation: StemcellElevationLevel;
    popover: StemcellElevationLevel;
    modal: StemcellElevationLevel;
    notification: StemcellElevationLevel;
}>;

export type StemcellAppColorTokens = Partial<{
    system: StemcellColorToken;
    background: StemcellColorToken;
    foreground: StemcellColorToken;
    surface: StemcellColorToken;
    "surface-raised": StemcellColorToken;
    overlay: StemcellColorToken;
    "fg-muted": StemcellColorToken;
    "fg-subtle": StemcellColorToken;
    "fg-disabled": StemcellColorToken;
    link: StemcellColorToken;
    border: StemcellColorToken;
    divider: StemcellColorToken;
    shadow: StemcellColorToken;
    scrim: StemcellColorToken;
}>;

export type StemcellSemanticColorTokens = Partial<{
    bg: StemcellColorToken;
    fg: StemcellColorToken;
    border: StemcellColorToken;
    icon: StemcellColorToken;
    "focus-ring": StemcellColorToken;
    "bg-hover": StemcellColorToken;
    "bg-pressed": StemcellColorToken;
    "soft-bg": StemcellColorToken;
    "soft-fg": StemcellColorToken;
    "soft-border": StemcellColorToken;
    "soft-bg-hover": StemcellColorToken;
    "soft-bg-pressed": StemcellColorToken;
}>;

export type StemcellColorScaleTokens = Partial<{
    "50": StemcellColorToken;
    "100": StemcellColorToken;
    "200": StemcellColorToken;
    "300": StemcellColorToken;
    "400": StemcellColorToken;
    "500": StemcellColorToken;
    "600": StemcellColorToken;
    "700": StemcellColorToken;
    "800": StemcellColorToken;
    "900": StemcellColorToken;
}>;

export type StemcellTheme = {
    $extensions?: {
        stemcell?: {
            scheme?: "light" | "dark";
        };
    };
    color?: {
        app?: StemcellAppColorTokens;
        semantic?: Record<string, StemcellSemanticColorTokens>;
        [colorName: string]:
            | StemcellAppColorTokens
            | Record<string, StemcellSemanticColorTokens>
            | StemcellColorScaleTokens
            | undefined;
    };
    elevation?: StemcellElevationTokens;
    scrim?: StemcellColorToken;
};
