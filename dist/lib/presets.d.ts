import { SolverConfig } from './types.js';

interface Preset {
    id: string;
    name: string;
    description: string;
    config: SolverConfig;
}
declare const PRESETS: Preset[];

export { PRESETS, type Preset };
