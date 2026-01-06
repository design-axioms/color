import { DEFAULT_CONFIG } from "./defaults.ts";
import { AxiomaticError } from "./errors.ts";
import type { SolverConfig } from "./types.ts";
import { VIBES } from "./vibes.ts";

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === "object" && !Array.isArray(item);
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: DeepPartial<T>,
): T {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (isObject(sourceValue) && key in target && isObject(targetValue)) {
        (output as Record<string, unknown>)[key] = deepMerge(
          targetValue,
          sourceValue as DeepPartial<Record<string, unknown>>,
        );
      } else if (sourceValue !== undefined) {
        output[key as keyof T] = sourceValue as T[keyof T];
      }
    });
  }
  return output;
}

export function resolveConfig(userConfig: Partial<SolverConfig>): SolverConfig {
  // 1. Start with System Defaults
  let config = { ...DEFAULT_CONFIG };

  // 2. Apply Vibe Defaults (if selected)
  const vibeName = userConfig.vibe;
  if (vibeName) {
    const vibe = VIBES[vibeName];
    if (!vibe) {
      throw new AxiomaticError(
        "CONFIG_INVALID_VIBE",
        `Unknown vibe: ${JSON.stringify(vibeName)}.`,
        { vibe: vibeName, knownVibes: Object.keys(VIBES) },
      );
    }

    config = deepMerge(config, vibe.config);
  }

  // 3. Apply User Config
  config = deepMerge(config, userConfig);

  return config;
}
