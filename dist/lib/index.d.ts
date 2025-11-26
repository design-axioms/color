import { SolverConfig, SurfaceConfig, Mode } from './types.js';
export { SURFACES } from './constants.js';
export { DEFAULT_CONFIG } from './defaults.js';
export { PRESETS, Preset } from './presets.js';
export { ThemeManager, ThemeManagerOptions, ThemeMode, updateFavicon, updateThemeColor } from './browser.js';

declare function getKeyColorStats(keyColors?: Record<string, string>): {
    lightness?: number;
    chroma?: number;
    hue?: number;
};
declare function solve(config: SolverConfig): {
    surfaces: SurfaceConfig[];
    backgrounds: Map<string, Record<Mode, number>>;
};

export { getKeyColorStats, solve };
