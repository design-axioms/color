import { converter } from "culori";
import { generateChartAlgebra } from "./charts.ts";
import { solveBorderAlpha, solveForegroundSpec } from "./math.ts";
import type {
  BorderTargets,
  ConfigOptions,
  PresetsConfig,
  SurfaceGroup,
  Theme,
} from "./types.ts";
import { generatePresetUtilities } from "./utilities.ts";

const toOklch = converter("oklch");

export function generateTokensCss(
  groups: SurfaceGroup[],
  theme: Theme,
  borderTargets?: BorderTargets,
  options?: ConfigOptions,
  keyColors?: Record<string, string>,
  presets?: PresetsConfig,
): string {
  const rootLines: string[] = [];
  const propertyLines: string[] = [];
  const backgrounds = theme.backgrounds;

  const prefix = options?.prefix ? `${options.prefix}-` : "";
  const rootSelector = options?.selector || ":root";

  const v = (name: string): string => `--${prefix}${name}`;
  const pv = (name: string): string => `--_${prefix}${name}`;

  // Note: We assume @property definitions are loaded via engine.css
  // Re-declaring them here causes transition glitches in some browsers
  // when the stylesheet is updated dynamically.

  const toNumber = (n: number): number => parseFloat(n.toFixed(4));

  // --- Primitives (Shadows & Focus) ---
  rootLines.push(`${rootSelector} {`);

  // Inverted Surfaces List (for JS Runtime)
  const invertedSurfaces = groups
    .flatMap((g) => g.surfaces)
    .filter((s) => s.polarity === "inverted")
    .map((s) => `.surface-${s.slug}`)
    .join(", ");

  if (invertedSurfaces) {
    rootLines.push(`  ${pv("inverted-surfaces")}: "${invertedSurfaces}";`);
  }

  // Key Colors
  if (keyColors) {
    rootLines.push(`  /* Key Colors */`);
    for (const [name, value] of Object.entries(keyColors)) {
      const oklch = toOklch(value);
      if (oklch) {
        const l = toNumber(oklch.l);
        const c = toNumber(oklch.c);
        const h = toNumber(oklch.h || 0);

        rootLines.push(`  ${v(`key-${name}-color`)}: oklch(${l} ${c} ${h});`);
        rootLines.push(`  ${pv(`hue-${name}`)}: ${h};`);
        rootLines.push(`  ${pv(`chroma-${name}`)}: ${c};`);
      } else if (keyColors[value]) {
        // Alias
        rootLines.push(
          `  ${v(`key-${name}-color`)}: var(${v(`key-${value}-color`)});`,
        );
        rootLines.push(`  ${pv(`hue-${name}`)}: var(${pv(`hue-${value}`)});`);
        rootLines.push(
          `  ${pv(`chroma-${name}`)}: var(${pv(`chroma-${value}`)});`,
        );
      }
    }
  }

  rootLines.push(`  /* Elevation */`);
  const { shadows, focus } = theme.primitives;

  // Shadows
  for (const [size, token] of Object.entries(shadows)) {
    // Merge light and dark shadow definitions to use light-dark() for colors only
    const lightColors = token.light.match(/oklch\([^)]+\)/g) || [];
    const darkColors = token.dark.match(/oklch\([^)]+\)/g) || [];

    if (lightColors.length > 0 && lightColors.length === darkColors.length) {
      let index = 0;
      const merged = token.light.replace(/oklch\([^)]+\)/g, (match) => {
        const darkColor = darkColors[index];
        index++;
        return `light-dark(${match}, ${darkColor})`;
      });
      rootLines.push(`  ${v(`shadow-${size}`)}: ${merged};`);
    } else {
      // Fallback for mismatched structures
      rootLines.push(
        `  ${v(`shadow-${size}`)}: light-dark(${token.light}, ${token.dark});`,
      );
    }
  }

  // Focus
  rootLines.push(`  /* Focus */`);
  rootLines.push(
    `  ${v("focus-ring-color")}: light-dark(${focus.ring.light}, ${
      focus.ring.dark
    });`,
  );

  // Highlight
  rootLines.push(`  /* Highlight */`);
  const { highlight } = theme.primitives;
  rootLines.push(
    `  ${v("highlight-ring-color")}: light-dark(${highlight.ring.light}, ${
      highlight.ring.dark
    });`,
  );
  rootLines.push(
    `  ${v("highlight-surface-color")}: light-dark(${
      highlight.surface.light
    }, ${highlight.surface.dark});`,
  );

  rootLines.push(`}`);
  rootLines.push("");

  // Data Visualization Palette
  if (theme.charts.length > 0) {
    rootLines.push(`* {`);
    rootLines.push(`  /* Data Visualization (Reactive) */`);
    theme.charts.forEach((chart, index) => {
      const i = index + 1;
      const algebra = generateChartAlgebra(i, chart, options?.prefix);

      algebra.variables.forEach((v) => {
        rootLines.push(`  ${v.name}: ${v.value};`);
      });
      rootLines.push(algebra.css);
    });
    rootLines.push(`}`);
    rootLines.push("");
  }

  for (const group of groups) {
    for (const surface of group.surfaces) {
      const bgLight = backgrounds.get(surface.slug)?.light ?? {
        l: 0,
        c: 0,
        h: 0,
      };
      const bgDark = backgrounds.get(surface.slug)?.dark ?? {
        l: 0,
        c: 0,
        h: 0,
      };

      const lightSpec = solveForegroundSpec(bgLight.l);
      const darkSpec = solveForegroundSpec(bgDark.l);

      // Hue shift is already applied in solve()

      // Generate the Class Definition
      const selectorPrefix = rootSelector !== ":root" ? `${rootSelector} ` : "";
      let classSelector = `.surface-${surface.slug}`;

      // Special case: Apply 'page' surface tokens to body
      if (surface.slug === "page") {
        classSelector += ", body";
      }

      rootLines.push(`${selectorPrefix}${classSelector} {`);

      // 1. Surface Token
      // Define local variables for the solved values to allow overrides
      rootLines.push(`  ${pv("local-light-h")}: ${toNumber(bgLight.h)};`);
      rootLines.push(`  ${pv("local-light-c")}: ${toNumber(bgLight.c)};`);
      rootLines.push(`  ${pv("local-dark-h")}: ${toNumber(bgDark.h)};`);
      rootLines.push(`  ${pv("local-dark-c")}: ${toNumber(bgDark.c)};`);

      // Determine final hue/chroma...
      // We need to set --alpha-hue and --alpha-beta for this surface.
      // Since these are numbers, we can't use light-dark().
      // We'll default to the light mode values, but allow overrides via media query if needed.
      // Ideally, surfaces shouldn't change hue wildly between modes.

      rootLines.push(`  --alpha-hue: ${toNumber(bgLight.h)};`);
      rootLines.push(`  --alpha-beta: ${toNumber(bgLight.c)};`);

      // If dark mode differs significantly, we might need a media query here.
      // For now, we assume stability or that the engine handles it via the token L extraction.
      // Wait, the engine uses alpha-hue/beta for the *result*.
      // If we want the surface to be "Brand Blue", we must set alpha-hue to Blue.

      // Also set the structure fallback
      rootLines.push(`  --alpha-structure: 1px solid CanvasText;`);

      rootLines.push(
        `  ${v("surface-token")}: light-dark(
    oklch(${toNumber(bgLight.l)} var(--alpha-beta) var(--alpha-hue)),
    oklch(${toNumber(bgDark.l)} var(--alpha-beta) var(--alpha-hue))
  );`,
      );

      // 2. Text Tokens
      // Standard
      rootLines.push(
        `  ${v("text-high-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-high"])} 0 0),
    oklch(${toNumber(darkSpec["fg-high"])} 0 0)
  );`,
      );

      rootLines.push(
        `  ${v("text-body-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-baseline"])} 0 0),
    oklch(${toNumber(darkSpec["fg-baseline"])} 0 0)
  );`,
      );

      rootLines.push(
        `  ${v("text-subtle-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-subtle"])} 0 0),
    oklch(${toNumber(darkSpec["fg-subtle"])} 0 0)
  );`,
      );

      rootLines.push(
        `  ${v("text-subtlest-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-subtlest"])} 0 0),
    oklch(${toNumber(darkSpec["fg-subtlest"])} 0 0)
  );`,
      );

      // High Contrast
      rootLines.push(
        `  ${v("text-high-hc-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-high-hc"])} 0 0),
    oklch(${toNumber(darkSpec["fg-high-hc"])} 0 0)
  );`,
      );

      rootLines.push(
        `  ${v("text-body-hc-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-baseline-hc"])} 0 0),
    oklch(${toNumber(darkSpec["fg-baseline-hc"])} 0 0)
  );`,
      );

      rootLines.push(
        `  ${v("text-subtle-hc-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-subtle-hc"])} 0 0),
    oklch(${toNumber(darkSpec["fg-subtle-hc"])} 0 0)
  );`,
      );

      rootLines.push(
        `  ${v("text-subtlest-hc-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-subtlest-hc"])} 0 0),
    oklch(${toNumber(darkSpec["fg-subtlest-hc"])} 0 0)
  );`,
      );

      // 3. Border Tokens
      if (borderTargets) {
        const solveBorder = (
          bgL: number,
          textL: number,
          target: number,
        ): number => solveBorderAlpha(bgL, textL, target);

        const lightDec = solveBorder(
          bgLight.l,
          lightSpec["fg-strong"],
          borderTargets.decorative,
        );
        const darkDec = solveBorder(
          bgDark.l,
          darkSpec["fg-strong"],
          borderTargets.decorative,
        );
        const lightInt = solveBorder(
          bgLight.l,
          lightSpec["fg-strong"],
          borderTargets.interactive,
        );
        const darkInt = solveBorder(
          bgDark.l,
          darkSpec["fg-strong"],
          borderTargets.interactive,
        );

        const lightBorderL = lightSpec["fg-strong"];
        const darkBorderL = darkSpec["fg-strong"];

        rootLines.push(
          `  ${v("border-dec-token")}: light-dark(
    oklch(${toNumber(lightBorderL)} 0 0 / ${toNumber(lightDec)}),
    oklch(${toNumber(darkBorderL)} 0 0 / ${toNumber(darkDec)})
  );`,
        );

        rootLines.push(
          `  ${v("border-int-token")}: light-dark(
    oklch(${toNumber(lightBorderL)} 0 0 / ${toNumber(lightInt)}),
    oklch(${toNumber(darkBorderL)} 0 0 / ${toNumber(darkInt)})
  );`,
        );
      }

      rootLines.push(`}`); // End class

      // States (Hover/Active)
      if (surface.states) {
        surface.states.forEach((state) => {
          const stateSlug = `${surface.slug}-${state.name}`;
          const bgState = backgrounds.get(stateSlug);

          if (bgState) {
            // We generate a modifier class? Or pseudo-class?
            // The config says "states: [{name: 'hover'}]".
            // Usually this maps to `.surface-card:hover`.
            // But sometimes it might be a class `.surface-card-selected`.
            // Let's assume pseudo-classes for standard names, and classes for others?
            // The original code generated `--surface-card-hover-token`.
            // And `utilities.css` mapped `.surface-card:hover` to that token.

            // Here we generate:
            // .surface-card:hover { --surface-token: ... }

            const stateSelector =
              state.name === "hover" || state.name === "active"
                ? `.surface-${surface.slug}:${state.name}`
                : `.surface-${surface.slug}-${state.name}`; // e.g. .surface-card-selected

            rootLines.push(`${selectorPrefix}${stateSelector} {`);

            // Define local variables for the state
            rootLines.push(
              `  ${pv("local-light-h")}: ${toNumber(bgState.light.h)};`,
            );
            rootLines.push(
              `  ${pv("local-light-c")}: ${toNumber(bgState.light.c)};`,
            );
            rootLines.push(
              `  ${pv("local-dark-h")}: ${toNumber(bgState.dark.h)};`,
            );
            rootLines.push(
              `  ${pv("local-dark-c")}: ${toNumber(bgState.dark.c)};`,
            );

            rootLines.push(
              `  ${v("surface-token")}: light-dark(
    oklch(${toNumber(bgState.light.l)} var(--alpha-beta) var(--alpha-hue)),
    oklch(${toNumber(bgState.dark.l)} var(--alpha-beta) var(--alpha-hue))
  );`,
            );
            rootLines.push(`}`);
          }
        });
      }
      rootLines.push("");
    }
  }

  // Generate Utility Classes for Key Colors
  if (keyColors) {
    for (const name of Object.keys(keyColors)) {
      rootLines.push(`.hue-${name} {`);
      // Set Atmosphere
      rootLines.push(`  --alpha-hue: var(${pv(`hue-${name}`)});`);
      rootLines.push(`  --alpha-beta: var(${pv(`chroma-${name}`)});`);

      // Set Structure Fallback (for X-Ray)
      // We use the key color as the border color
      rootLines.push(
        `  --alpha-structure: 2px solid var(${v(`key-${name}-color`)});`,
      );

      rootLines.push(`}`);
      rootLines.push("");
    }
  }

  // Standard Utilities
  rootLines.push(`/* Core Utilities (Reactive Pipeline) */`);

  // Text High
  rootLines.push(
    `.text-strong { ${pv("text-lightness-source")}: var(${v("text-high-token")}); font-weight: 600; }`,
  );

  // Text Body
  rootLines.push(
    `.text-body { ${pv("text-lightness-source")}: var(${v("text-body-token")}); }`,
  );

  // Text Subtle
  rootLines.push(
    `.text-subtle { ${pv("text-lightness-source")}: var(${v("text-subtle-token")}); }`,
  );

  // Text Subtlest
  rootLines.push(
    `.text-subtlest { ${pv("text-lightness-source")}: var(${v("text-subtlest-token")}); }`,
  );

  // High Contrast Overrides
  rootLines.push(`@media (prefers-contrast: more) {`);
  rootLines.push(
    `  .text-strong { ${pv("text-lightness-source")}: var(${v("text-high-hc-token")}); }`,
  );
  rootLines.push(
    `  .text-body { ${pv("text-lightness-source")}: var(${v("text-body-hc-token")}); }`,
  );
  rootLines.push(
    `  .text-subtle { ${pv("text-lightness-source")}: var(${v("text-subtle-hc-token")}); }`,
  );
  rootLines.push(
    `  .text-subtlest { ${pv("text-lightness-source")}: var(${v("text-subtlest-hc-token")}); }`,
  );
  rootLines.push(`}`);

  rootLines.push("");
  rootLines.push(generatePresetUtilities(presets, options));

  return [...propertyLines, "", ...rootLines].join("\n");
}
