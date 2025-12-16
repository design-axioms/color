import { solveBorderAlpha, solveForegroundSpec } from "../math.ts";
import type {
  BorderTargets,
  ConfigOptions,
  SurfaceGroup,
  Theme,
} from "../types.ts";

export function generateSurfaces(
  groups: SurfaceGroup[],
  theme: Theme,
  borderTargets?: BorderTargets,
  options?: ConfigOptions,
): string[] {
  const lines: string[] = [];
  const backgrounds = theme.backgrounds;
  const prefix = options?.prefix ? `${options.prefix}-` : "";
  const rootSelector = options?.selector || ":root";

  const v = (name: string): string => `--${prefix}${name}`;
  const pv = (name: string): string => `--_${prefix}${name}`;
  const toNumber = (n: number): number => parseFloat(n.toFixed(4));

  const mixVar = pv("mode-mix");
  const mix = (): string => `var(${mixVar})`;
  const lerp = (light: number, dark: number): string =>
    `calc(${toNumber(light)} + (${toNumber(dark)} - ${toNumber(light)}) * ${mix()})`;

  // Inverted Surfaces List (for JS Runtime)
  const invertedSurfaces = groups
    .flatMap((g) => g.surfaces)
    .filter((s) => s.polarity === "inverted")
    .map((s) => `.surface-${s.slug}`)
    .join(", ");

  if (invertedSurfaces) {
    lines.push(`${rootSelector} {`);
    lines.push(`  ${pv("inverted-surfaces")}: "${invertedSurfaces}";`);
    lines.push(`}`);
    lines.push("");
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

      const selectorPrefix = rootSelector !== ":root" ? `${rootSelector} ` : "";
      let classSelector = `.surface-${surface.slug}`;

      if (surface.slug === "page") {
        classSelector += ", body";
      }

      lines.push(`${selectorPrefix}${classSelector} {`);

      // 1. Surface Token
      lines.push(`  ${pv("local-light-h")}: ${toNumber(bgLight.h)};`);
      lines.push(`  ${pv("local-light-c")}: ${toNumber(bgLight.c)};`);
      lines.push(`  ${pv("local-light-l")}: ${toNumber(bgLight.l)};`);
      lines.push(`  ${pv("local-dark-h")}: ${toNumber(bgDark.h)};`);
      lines.push(`  ${pv("local-dark-c")}: ${toNumber(bgDark.c)};`);
      lines.push(`  ${pv("local-dark-l")}: ${toNumber(bgDark.l)};`);

      // Map Tau (-1..1) -> Mix (0..1)
      // Tau =  1 => Light endpoint
      // Tau = -1 => Dark endpoint
      lines.push(`  ${mixVar}: calc((1 - var(--tau)) / 2);`);

      lines.push(`  --alpha-hue: ${lerp(bgLight.h, bgDark.h)};`);
      lines.push(`  --alpha-beta: ${lerp(bgLight.c, bgDark.c)};`);
      lines.push(`  --alpha-structure: 1px solid CanvasText;`);

      lines.push(
        `  ${v("surface-token")}: oklch(
    ${lerp(bgLight.l, bgDark.l)}
    var(--alpha-beta)
    var(--alpha-hue)
  );`,
      );

      // 2. Text Tokens
      const textTokens = [
        { name: "text-high-token", key: "fg-high" },
        { name: "text-body-token", key: "fg-baseline" },
        { name: "text-subtle-token", key: "fg-subtle" },
        { name: "text-subtlest-token", key: "fg-subtlest" },
      ] as const;

      for (const token of textTokens) {
        lines.push(
          `  ${v(token.name)}: oklch(
    ${lerp(lightSpec[token.key], darkSpec[token.key])}
    0
    0
  );`,
        );
      }

      // High Contrast
      const hcTokens = [
        { name: "text-high-hc-token", key: "fg-high-hc" },
        { name: "text-body-hc-token", key: "fg-baseline-hc" },
        { name: "text-subtle-hc-token", key: "fg-subtle-hc" },
        { name: "text-subtlest-hc-token", key: "fg-subtlest-hc" },
      ] as const;

      for (const token of hcTokens) {
        lines.push(
          `  ${v(token.name)}: oklch(
    ${lerp(lightSpec[token.key], darkSpec[token.key])}
    0
    0
  );`,
        );
      }

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

        lines.push(
          `  ${v("border-dec-token")}: oklch(
    ${lerp(lightBorderL, darkBorderL)}
    0
    0
    /
    ${lerp(lightDec, darkDec)}
  );`,
        );

        lines.push(
          `  ${v("border-int-token")}: oklch(
    ${lerp(lightBorderL, darkBorderL)}
    0
    0
    /
    ${lerp(lightInt, darkInt)}
  );`,
        );
      }

      lines.push(`}`); // End class

      // States
      if (surface.states) {
        surface.states.forEach((state) => {
          const stateSlug = `${surface.slug}-${state.name}`;
          const bgState = backgrounds.get(stateSlug);

          if (bgState) {
            const stateSelector =
              state.name === "hover" || state.name === "active"
                ? `.surface-${surface.slug}:${state.name}`
                : `.surface-${surface.slug}-${state.name}`;

            lines.push(`${selectorPrefix}${stateSelector} {`);
            lines.push(
              `  ${pv("local-light-h")}: ${toNumber(bgState.light.h)};`,
            );
            lines.push(
              `  ${pv("local-light-c")}: ${toNumber(bgState.light.c)};`,
            );
            lines.push(
              `  ${pv("local-light-l")}: ${toNumber(bgState.light.l)};`,
            );
            lines.push(`  ${pv("local-dark-h")}: ${toNumber(bgState.dark.h)};`);
            lines.push(`  ${pv("local-dark-c")}: ${toNumber(bgState.dark.c)};`);
            lines.push(`  ${pv("local-dark-l")}: ${toNumber(bgState.dark.l)};`);

            lines.push(`  ${mixVar}: calc((1 - var(--tau)) / 2);`);

            lines.push(
              `  --alpha-hue: ${lerp(bgState.light.h, bgState.dark.h)};`,
            );
            lines.push(
              `  --alpha-beta: ${lerp(bgState.light.c, bgState.dark.c)};`,
            );

            lines.push(
              `  ${v("surface-token")}: oklch(
    ${lerp(bgState.light.l, bgState.dark.l)}
    var(--alpha-beta)
    var(--alpha-hue)
  );`,
            );
            lines.push(`}`);
          }
        });
      }
      lines.push("");
    }
  }
  return lines;
}
