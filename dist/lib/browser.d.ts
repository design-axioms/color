/**
 * Updates the <meta name="theme-color"> tag to match the computed background color
 * of the document body.
 *
 * Call this function whenever the theme changes (e.g. after switching modes).
 */
declare function updateThemeColor(): void;
/**
 * Updates the favicon to match the current theme color.
 *
 * @param getSvg A function that returns an SVG string. It receives the current brand color as an argument.
 */
declare function updateFavicon(getSvg: (color: string) => string): void;
type ThemeMode = "light" | "dark" | "system";
interface ThemeManagerOptions {
    /**
     * The element to apply the theme to. Defaults to document.documentElement.
     */
    root?: HTMLElement;
    /**
     * The class to apply when the theme is 'light'.
     * If not provided, sets style="color-scheme: light".
     */
    lightClass?: string;
    /**
     * The class to apply when the theme is 'dark'.
     * If not provided, sets style="color-scheme: dark".
     */
    darkClass?: string;
    /**
     * A function to generate the favicon SVG based on the current theme color.
     * If provided, the favicon will be updated automatically.
     */
    faviconGenerator?: (color: string) => string;
}
declare class ThemeManager {
    private root;
    private lightClass?;
    private darkClass?;
    private faviconGenerator?;
    private _mode;
    private mediaQuery;
    constructor(options?: ThemeManagerOptions);
    get mode(): ThemeMode;
    get resolvedMode(): "light" | "dark";
    setMode(mode: ThemeMode): void;
    private handleSystemChange;
    private apply;
    private sync;
    dispose(): void;
}

export { ThemeManager, type ThemeManagerOptions, type ThemeMode, updateFavicon, updateThemeColor };
