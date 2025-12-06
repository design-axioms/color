import { converter } from "culori";
import { solveBorderAlpha, solveForegroundSpec } from "./math.ts";
import type {
  BorderTargets,
  ConfigOptions,
  PresetsConfig,
  SolverConfig,
  SurfaceGroup,
  Theme,
} from "./types.ts";
import { generatePresetUtilities } from "./utilities.ts";

const toOklch = converter("oklch");

export function toHighContrast(config: SolverConfig): SolverConfig {
  return {
    ...config,
    anchors: {
      ...config.anchors,
      keyColors: {}, // Force grayscale
      page: {
        ...config.anchors.page,
        light: {
          ...config.anchors.page.light,
          start: { background: 1.0, adjustable: false },
          end: { background: 0.0, adjustable: false },
        },
        dark: {
          ...config.anchors.page.dark,
          start: { background: 0.0, adjustable: false },
          end: { background: 1.0, adjustable: false },
        },
      },
      inverted: {
        ...config.anchors.inverted,
        light: {
          ...config.anchors.inverted.light,
          start: { background: 0.0, adjustable: false },
          end: { background: 1.0, adjustable: false },
        },
        dark: {
          ...config.anchors.inverted.dark,
          start: { background: 1.0, adjustable: false },
          end: { background: 0.0, adjustable: false },
        },
      },
    },
  };
}

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
    rootLines.push(
      `  ${v(`shadow-${size}`)}: light-dark(${token.light}, ${token.dark});`,
    );
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

  // Data Visualization Palette
  if (theme.charts.length > 0) {
    rootLines.push(`  /* Data Visualization */`);
    theme.charts.forEach((chart, index) => {
      rootLines.push(
        `  ${v(`chart-${index + 1}`)}: light-dark(
    oklch(${toNumber(chart.light.l)} ${toNumber(chart.light.c)} ${toNumber(
      chart.light.h,
    )}),
    oklch(${toNumber(chart.dark.l)} ${toNumber(chart.dark.c)} ${toNumber(
      chart.dark.h,
    )})
  );`,
      );
    });
  }

  rootLines.push(`}`);
  rootLines.push("");

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

      // Determine final hue/chroma, preferring --base-hue/--base-chroma if set (by utility classes)
      // Heuristic: Use full chroma (context-chroma) for high-contrast surfaces (Filled),
      // and tinted chroma (base-chroma) for low-contrast surfaces (Tinted).
      const isLightModeFilled = bgLight.l < 0.6;
      const isDarkModeFilled = bgDark.l >= 0.6;

      const lightChromaVar = isLightModeFilled
        ? pv("context-chroma")
        : pv("base-chroma");
      const darkChromaVar = isDarkModeFilled
        ? pv("context-chroma")
        : pv("base-chroma");

      rootLines.push(
        `  ${pv("surface-light-h")}: var(${pv("base-hue")}, var(${pv("local-light-h")}));`,
      );
      rootLines.push(
        `  ${pv("surface-light-c")}: var(${lightChromaVar}, var(${pv("local-light-c")}));`,
      );
      rootLines.push(
        `  ${pv("surface-dark-h")}: var(${pv("base-hue")}, var(${pv("local-dark-h")}));`,
      );
      rootLines.push(
        `  ${pv("surface-dark-c")}: var(${darkChromaVar}, var(${pv("local-dark-c")}));`,
      );

      rootLines.push(
        `  ${v("surface-token")}: light-dark(
    oklch(${toNumber(bgLight.l)} var(${pv("surface-light-c")}) var(${pv("surface-light-h")})),
    oklch(${toNumber(bgDark.l)} var(${pv("surface-dark-c")}) var(${pv("surface-dark-h")}))
  );`,
      );

      // 2. Text Tokens
      rootLines.push(
        `  ${v("text-high-token")}: light-dark(
    oklch(${toNumber(lightSpec["fg-high"])} 0 0),
    oklch(${toNumber(darkSpec["fg-high"])} 0 0)
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

            const isLightModeFilled = bgState.light.l < 0.6;
            const isDarkModeFilled = bgState.dark.l >= 0.6;

            const lightChromaVar = isLightModeFilled
              ? pv("context-chroma")
              : pv("base-chroma");
            const darkChromaVar = isDarkModeFilled
              ? pv("context-chroma")
              : pv("base-chroma");

            rootLines.push(
              `  ${v("surface-token")}: light-dark(
    oklch(${toNumber(bgState.light.l)} var(${lightChromaVar}, var(${pv("local-light-c")})) var(${pv("base-hue")}, var(${pv("local-light-h")}))),
    oklch(${toNumber(bgState.dark.l)} var(${darkChromaVar}, var(${pv("local-dark-c")})) var(${pv("base-hue")}, var(${pv("local-dark-h")})))
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
      rootLines.push(`  ${pv("context-hue")}: var(${pv(`hue-${name}`)});`);
      rootLines.push(
        `  ${pv("context-chroma")}: var(${pv(`chroma-${name}`)});`,
      );
      rootLines.push(``);
      rootLines.push(`  /* 1. Surface Tinting */`);
      rootLines.push(`  ${pv("base-hue")}: var(${pv("context-hue")});`);
      rootLines.push(`  ${pv("hue-adjust")}: 0;`);
      rootLines.push(
        `  ${pv("base-chroma")}: calc(var(${pv("context-chroma")}) * 0.1);`,
      );
      rootLines.push(``);
      rootLines.push(`  /* 2. Text Tinting (Indirection) */`);
      rootLines.push(`  ${pv("text-hue-source")}: var(${pv("context-hue")});`);
      rootLines.push(
        `  ${pv("text-chroma-source")}: var(${pv("context-chroma")});`,
      );
      rootLines.push(`}`);
      rootLines.push("");
    }
  }

  // Standard Utilities
  rootLines.push(`/* Core Utilities (Reactive Pipeline) */`);
  rootLines.push(
    `.text-subtle { ${pv("text-lightness-source")}: var(${v("text-subtle-token")}); }`,
  );
  rootLines.push(
    `.text-subtlest { ${pv("text-lightness-source")}: var(${v("text-subtlest-token")}); }`,
  );
  rootLines.push(
    `.text-strong { ${pv("text-lightness-source")}: var(${v("text-high-token")}); font-weight: 600; }`,
  );

  rootLines.push("");
  rootLines.push(generatePresetUtilities(presets, options));

  return [...propertyLines, "", ...rootLines].join("\n");
}
