/**
 * Starlight framework contract adapter.
 *
 * This adapter enables the inspector engine to detect violations of the
 * Starlight integration contract (e.g., chrome borders using non-bridge
 * variables, transitions that cause "popping").
 *
 * @module
 */

import type {
  FrameworkContractAdapter,
  FrameworkContractResult,
  FrameworkContractScanOptions,
} from "../../inspector/types.ts";
import { scanStarlightChromeContractViolations } from "../../inspector/starlight-chrome-contract.ts";
import {
  STARLIGHT_CHROME_CONTRACT,
  type StarlightChromeContractSpec,
} from "./chrome-contract-spec.ts";

/**
 * Options for creating the Starlight contract adapter.
 */
export interface StarlightContractAdapterOptions {
  /**
   * Custom contract specification. Defaults to STARLIGHT_CHROME_CONTRACT.
   */
  spec?: StarlightChromeContractSpec;

  /**
   * Maximum elements to report per CSS rule. Defaults to 6.
   */
  maxElementsPerRule?: number;
}

/**
 * Creates a Starlight framework contract adapter.
 *
 * @example
 * ```ts
 * import { createStarlightContractAdapter } from "@axiomatic-design/color/integrations/starlight";
 *
 * const adapter = createStarlightContractAdapter();
 * const result = engine.scanForFrameworkContractViolations(adapter);
 * ```
 */
export function createStarlightContractAdapter(
  options?: StarlightContractAdapterOptions,
): FrameworkContractAdapter {
  const spec = options?.spec ?? STARLIGHT_CHROME_CONTRACT;
  const maxElementsPerRule = options?.maxElementsPerRule ?? 6;

  return {
    name: "Starlight",

    scan(scanOptions?: FrameworkContractScanOptions): FrameworkContractResult {
      return scanStarlightChromeContractViolations({
        ignoreContainer: scanOptions?.ignoreContainer,
        spec,
        maxElementsPerRule,
      });
    },
  };
}

/**
 * Pre-configured Starlight contract adapter using default settings.
 *
 * For most use cases, this is the adapter you want.
 */
export const starlightContractAdapter: FrameworkContractAdapter =
  createStarlightContractAdapter();

// Re-export types for convenience
export type { StarlightChromeContractSpec } from "./chrome-contract-spec.ts";
export { STARLIGHT_CHROME_CONTRACT } from "./chrome-contract-spec.ts";
