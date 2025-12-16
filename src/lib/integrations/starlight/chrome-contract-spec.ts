export type StarlightChromeContractSpec = {
  /**
   * Strings used as an intentionally-bounded heuristic to decide whether a CSS
   * rule selector is part of the Starlight "chrome" surface we care about.
   *
   * This list is an integration contract: if Starlight changes its markup, we
   * update this list rather than widening the scan to the entire DOM.
   */
  chromeSelectorHints: string[];

  /**
   * Variable names that are permitted as border/outline paint sources for
   * chrome rules.
   *
   * IMPORTANT: Starlight vars are only permitted when they are mapped to the
   * Axiomatic bridge exports in the adapter bridge file.
   */
  allowedBorderVarNames: string[];

  /**
   * Declarations to examine when scanning CSS rules for continuity regressions.
   *
   * This is intentionally limited to paint-affecting properties to avoid noise
   * (e.g. border-radius, border-width, etc).
   */
  paintRelevantProps: string[];

  /**
   * Substrings which, if present in a transition declaration, indicate a
   * competing animation source that can cause "border popping".
   */
  forbiddenTransitionSubstrings: Array<{ substring: string; reason: string }>;
};

export const STARLIGHT_CHROME_CONTRACT: StarlightChromeContractSpec = {
  chromeSelectorHints: [
    "#starlight__sidebar",
    ".page > .header",
    ".page.sl-flex > .header",
    "header.axm-starlight-header",
    ".axm-starlight-sidebar-host",
    "starlight-theme-select",
    "site-search",
    ".dialog-frame",
    ".right-sidebar",
  ],

  allowedBorderVarNames: [
    "--axm-bridge-border-int",
    "--axm-bridge-border-dec",

    // Starlight vars are allowed only when they are mapped to the bridge.
    "--sl-color-gray-4",
    "--sl-color-gray-5",
    "--sl-color-hairline",
    "--sl-color-hairline-light",
    "--sl-color-hairline-dark",
  ],

  paintRelevantProps: [
    // Border shorthands that can carry a color.
    "border",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-inline-start",
    "border-inline-end",

    // Explicit border paint.
    "border-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "border-inline-start-color",
    "border-inline-end-color",

    // Outline paint (occasionally used as hairlines).
    "outline",
    "outline-color",

    // Competing animation sources.
    "transition",
    "transition-property",
  ],

  forbiddenTransitionSubstrings: [
    { substring: "border", reason: "transition-touches-border" },
    { substring: "outline", reason: "transition-touches-outline" },
    { substring: "box-shadow", reason: "transition-touches-box-shadow" },
    { substring: "--axm-bridge-", reason: "transition-touches-bridge-vars" },
  ],
};
