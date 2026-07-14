export type StemcellDtcgToken<TType extends string, TValue> = {
    $value: TValue;
    $type: TType;
    $description?: string;
};

export type StemcellColorToken = StemcellDtcgToken<"color", string>;

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
};
