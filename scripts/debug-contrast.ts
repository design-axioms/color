import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { converter } from 'culori';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getSurfaceDefinitions,
  solveForegroundLightness,
  TARGET_CONTRAST,
  type SolverConfig,
} from './solver-engine.ts';

const CONFIG_PATH = join(import.meta.dirname, 'surface-lightness.config.json');
const CONFIG = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as SolverConfig;
const SURFACE_DEFINITIONS = getSurfaceDefinitions(CONFIG);

type Mode = 'light' | 'dark';

type ContrastBand = keyof typeof TARGET_CONTRAST;

type ReportRow = {
  surface: string;
  mode: Mode;
  band: ContrastBand;
  background: number;
  target: number;
  solved: number;
  contrast: number;
  warning: boolean;
};

const toRgb = converter('rgb');

function toRgbTriplet(lightness: number): [number, number, number] {
  const ok = { mode: 'oklch', l: clamp01(lightness), c: 0, h: 0 } as const;
  const rgb = toRgb(ok) as { mode: 'rgb'; r: number; g: number; b: number };

  if (!rgb || rgb.mode !== 'rgb') {
    throw new Error('Failed to convert OKLCH lightness to sRGB.');
  }

  const clampChannel = (value: number) => {
    const clamped = clamp01(value ?? 0);
    return Math.round(clamped * 255);
  };

  return [clampChannel(rgb.r), clampChannel(rgb.g), clampChannel(rgb.b)];
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function contrastForPair(foreground: number, background: number): number {
  const fgY = sRGBtoY(toRgbTriplet(foreground));
  const bgY = sRGBtoY(toRgbTriplet(background));
  const value = APCAcontrast(fgY, bgY);
  const numeric = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    throw new Error(`APCAcontrast returned a non-numeric value: ${value}`);
  }

  return Math.abs(numeric);
}

function logRow(row: ReportRow) {
  const { surface, mode, band, background, target, solved, contrast, warning } =
    row;
  const lines = [
    `Surface: ${surface} (${mode})`,
    `  Band: ${band}`,
    `  Background L: ${background.toFixed(4)}`,
    `  Target contrast: ${target.toFixed(2)}`,
    `  Solved L: ${solved.toFixed(4)}`,
    `  Result contrast: ${contrast.toFixed(2)}${warning ? '  <-- below target' : ''}`,
  ];

  console.log(lines.join('\n'));
  console.log('');
}

if (import.meta.main) {
  const bands: ContrastBand[] = ['strong', 'subtle', 'subtler'];
  const modes: Mode[] = ['light', 'dark'];

  for (const mode of modes) {
    for (const definition of SURFACE_DEFINITIONS) {
      const background = definition.lightness[mode];

      for (const band of bands) {
        const target = TARGET_CONTRAST[band];

        const solved = solveForegroundLightness(background, target);

        const roundedSolved = solved;
        const actualContrast = contrastForPair(roundedSolved, background);
        const warning = actualContrast + 0.01 < target; // allow small rounding delta

        const row: ReportRow = {
          surface: definition.slug,
          mode,
          band,
          background,
          target,
          solved: roundedSolved,
          contrast: actualContrast,
          warning,
        };

        logRow(row);
      }
    }
  }
}
