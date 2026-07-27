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
    /** The near, hard shadow. Elevation's geometry draws with this; the colour is the theme's, the geometry is not. */
    "shadow-umbra": StemcellColorToken;
    /** The far, soft shadow. */
    "shadow-penumbra": StemcellColorToken;
    scrim: StemcellColorToken;
}>;

/**
 * Syntax colours for code (color.md §10, RFC 0018). A third family alongside app and
 * semantic: not "what happens if you press this" (intent) and not the ground/text
 * hierarchy (app), but which lexical role a run of code plays. The set is closed at six
 * — identifiers, operators and punctuation stay on `app.foreground` — because every role
 * added has to stay distinguishable from its neighbours while clearing 4.5:1 on the code
 * surface, and both get harder as the set grows.
 */
export type StemcellCodeColorTokens = Partial<{
    comment: StemcellColorToken;
    keyword: StemcellColorToken;
    string: StemcellColorToken;
    number: StemcellColorToken;
    function: StemcellColorToken;
    type: StemcellColorToken;
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
        code?: StemcellCodeColorTokens;
        semantic?: Record<string, StemcellSemanticColorTokens>;
        [colorName: string]:
            | StemcellAppColorTokens
            | StemcellCodeColorTokens
            | Record<string, StemcellSemanticColorTokens>
            | StemcellColorScaleTokens
            | undefined;
    };
    /**
     * Elevation is deliberately absent. It is a structural layer (Art.3): a theme
     * supplies the colours elevation draws with — the surfaces above, and
     * app.shadow-umbra / -penumbra — but never the levels or the geometry, which
     * live in elevation.tokens.json and are built into every theme.
     */
    scrim?: StemcellColorToken;
};
