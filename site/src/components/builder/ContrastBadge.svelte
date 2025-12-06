<script lang="ts">
  import { contrastForPair } from "@axiomatic-design/color/math";
  import type { ColorSpec, Theme } from "@axiomatic-design/color/types";

  interface Props {
    slug: string;
    mode: "light" | "dark";
    solved: Theme | null;
    showStatus?: boolean;
  }

  let { slug, mode, solved, showStatus: _showStatus = false }: Props = $props();

  let surface = $derived(solved?.surfaces.find((s) => s.slug === slug));
  let computed = $derived(surface?.computed);

  // Lightness values for math
  let bgL = $derived(computed ? computed[mode].background : null);
  let polarity = $derived(surface?.polarity);

  // Color specs for visualization
  let bgSpec = $derived(solved?.backgrounds.get(slug)?.[mode]);

  // Page Background (for Hierarchy Delta)
  let pageBg = $derived(solved?.backgrounds.get("page")?.[mode]);
  let pageL = $derived(pageBg?.l ?? (mode === "light" ? 1 : 0));

  // Hierarchy Delta (Surface vs Page)
  let deltaLc = $derived(
    bgL !== null ? Math.round(Math.abs(contrastForPair(pageL, bgL))) : 0,
  );

  // Text Contrast (Safety)
  // Logic from math.ts textLightness
  let textL = $derived(
    polarity === "page" ? (mode === "light" ? 0 : 1) : mode === "light" ? 1 : 0,
  );

  let contrast = $derived(bgL !== null ? contrastForPair(textL, bgL) : 0);
  let score = $derived(Math.round(contrast));

  let status = $derived.by(() => {
    if (score < 45) return "Fail";
    if (score < 60) return "Weak";
    if (score < 75) return "Good";
    return "High";
  });

  let strokeClass = $derived.by(() => {
    if (score < 45) return "stroke-error";
    if (score < 60) return "stroke-warning";
    return "stroke-success";
  });

  function toCss(c: ColorSpec | undefined | null): string {
    if (!c) return "transparent";
    return `oklch(${c.l} ${c.c} ${c.h})`;
  }
</script>

{#if surface && computed}
  <div class="badge-group font-mono">
    <!-- Hierarchy Badge (Delta from Page) -->
    <span
      class="hierarchy-badge surface-workspace bordered"
      title="Hierarchy: {deltaLc} Lc units from Page background
Text Contrast: {score} Lc ({status})"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        class="hierarchy-icon"
        aria-hidden="true"
      >
        <!-- Outer Circle (Page) -->
        <circle cx="12" cy="12" r="12" fill={toCss(pageBg)} />
        <!-- Inner Circle (Surface) -->
        <circle
          cx="12"
          cy="12"
          r="6"
          fill={toCss(bgSpec)}
          class={strokeClass}
          stroke-width="2"
        />
      </svg>
      <span class="delta-value">Δ L<sup>c</sup> {deltaLc}</span>
    </span>
  </div>
{/if}

<style>
  .badge-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hierarchy-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    line-height: 1;
    white-space: nowrap;
  }

  .hierarchy-icon {
    border-radius: 50%;
    border: 1px solid var(--computed-border-dec-color);
  }

  /* Status Colors mapped to CSS variables */
  /* We assume these classes exist or we map them to vars */
  /* Actually, statusClass returns 'surface-status-error' etc. 
     We need to map those to colors. 
     Usually these are classes that set color/bg.
     Here we need a stroke color.
     Let's use a helper or style map.
  */

  sup {
    font-size: 0.6em;
    vertical-align: super;
    opacity: 0.8;
  }
</style>
