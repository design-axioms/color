import type { SolverConfig } from "@axiomatic-design/color";
import { DEFAULT_CONFIG } from "@axiomatic-design/color";
import demoConfig from "../color-config.json";

export function createVercelConfig(brandColor: string): SolverConfig {
  const cfg = demoConfig as unknown as Partial<SolverConfig>;
  const keyColors = (cfg.anchors as any)?.keyColors as
    | Record<string, string>
    | undefined;

  return {
    ...DEFAULT_CONFIG,
    ...cfg,
    anchors: {
      ...DEFAULT_CONFIG.anchors,
      ...(cfg.anchors as any),
      keyColors: {
        ...(DEFAULT_CONFIG.anchors.keyColors as Record<string, string>),
        ...(keyColors ?? {}),
        brand: brandColor,
      },
    },
  } as SolverConfig;
}
