import { SolverConfig, SurfaceGroup, Theme, BorderTargets, ConfigOptions } from './types.js';

declare function toHighContrast(config: SolverConfig): SolverConfig;
declare function generateTokensCss(groups: SurfaceGroup[], theme: Theme, borderTargets?: BorderTargets, options?: ConfigOptions): string;

export { generateTokensCss, toHighContrast };
