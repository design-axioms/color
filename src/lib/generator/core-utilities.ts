import type { ConfigOptions } from "../types.ts";

export function generateCoreUtilities(
  options?: ConfigOptions,
  keyColors?: Record<string, string>,
): string[] {
  const lines: string[] = [];
  const prefix = options?.prefix ? `${options.prefix}-` : "";
  const v = (name: string): string => `--${prefix}${name}`;
  const pv = (name: string): string => `--_${prefix}${name}`;

  const addHueAlias = (className: string, key: string): void => {
    if (!keyColors) return;
    if (!(key in keyColors)) return;
    lines.push(`.${className} {`);
    lines.push(`  --alpha-hue: var(${pv(`hue-${key}`)});`);
    lines.push(`  --alpha-beta: var(${pv(`chroma-${key}`)});`);
    lines.push(`}`);
    lines.push("");
  };

  // Generate Utility Classes for Key Colors
  if (keyColors) {
    for (const name of Object.keys(keyColors)) {
      lines.push(`.hue-${name} {`);
      lines.push(`  --alpha-hue: var(${pv(`hue-${name}`)});`);
      lines.push(`  --alpha-beta: var(${pv(`chroma-${name}`)});`);
      lines.push(
        `  --alpha-structure: 2px solid var(${v(`key-${name}-color`)});`,
      );
      lines.push(`}`);
      lines.push("");
    }
  }

  lines.push(`/* Core Utilities (Reactive Pipeline) */`);

  const textUtils = [
    { class: "text-high", var: "text-high-token" },
    { class: "text-strong", var: "text-high-token", weight: "600" },
    { class: "text-body", var: "text-body-token" },
    { class: "text-subtle", var: "text-subtle-token" },
    { class: "text-subtlest", var: "text-subtlest-token" },
    // Back-compat / semantic aliases used in docs + demos
    { class: "text-content", var: "text-body-token" },
  ];

  for (const util of textUtils) {
    let rule = `.${util.class} { ${pv("text-lightness-source")}: var(${v(
      util.var,
    )});`;
    if (util.weight) {
      rule += ` font-weight: ${util.weight};`;
    }
    rule += " }";
    lines.push(rule);
  }

  // Semantic hue-based text intents (composition-friendly)
  // These intentionally do NOT set text lightness; pair with `.text-subtle`, etc.
  addHueAlias("text-brand", "brand");
  addHueAlias("text-warning", "warning");
  addHueAlias("text-positive", "success");
  addHueAlias("text-action", "brand");

  // Background helpers (used by docs/builder UI)
  // These rely on the engine's computed variables in the current context.
  lines.push(
    `.bg-surface { background-color: var(${pv("computed-surface")}); }`,
  );
  lines.push(
    `.bg-strong { background-color: var(${pv("computed-fg-color")}); }`,
  );
  lines.push(`.text-inverse { color: var(${pv("computed-surface")}); }`);
  lines.push("");

  // Reserved-prefix local UI class used by the debug HUD.
  // Making it a real emitted token avoids per-config strict false negatives.
  lines.push(`.hue-slider {}`);
  lines.push("");

  // High Contrast Overrides
  lines.push(`@media (prefers-contrast: more) {`);
  const hcUtils = [
    { class: "text-high", var: "text-high-hc-token" },
    { class: "text-strong", var: "text-high-hc-token" },
    { class: "text-body", var: "text-body-hc-token" },
    { class: "text-subtle", var: "text-subtle-hc-token" },
    { class: "text-subtlest", var: "text-subtlest-hc-token" },
    { class: "text-content", var: "text-body-hc-token" },
  ];

  for (const util of hcUtils) {
    lines.push(
      `  .${util.class} { ${pv("text-lightness-source")}: var(${v(
        util.var,
      )}); }`,
    );
  }
  lines.push(`}`);
  lines.push("");

  return lines;
}
