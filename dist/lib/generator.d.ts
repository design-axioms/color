import { SurfaceGroup, Mode, HueShiftConfig, BorderTargets } from './types.js';

declare function generateTokensCss(groups: SurfaceGroup[], backgrounds: Map<string, Record<Mode, number>>, hueShiftConfig?: HueShiftConfig, borderTargets?: BorderTargets, selector?: string): string;

export { generateTokensCss };
