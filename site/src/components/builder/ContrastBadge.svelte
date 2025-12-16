<script lang="ts">
  import { contrastForPair } from "@axiomatic-design/color/math";
  import type { Theme } from "@axiomatic-design/color/types";

  interface Props {
    slug: string;
    mode: "light" | "dark";
    solved: Theme | null;
    showStatus?: boolean;
  }

  const {
    slug,
    mode,
    solved,
    showStatus: _showStatus = false,
  }: Props = $props();

  const surface = $derived(solved?.surfaces.find((s) => s.slug === slug));
  const computed = $derived(surface?.computed);

  // Lightness values for math
  const bgL = $derived(computed ? computed[mode].background : null);
  const polarity = $derived(surface?.polarity);

  // Page Background (for Hierarchy Delta)
  const pageBg = $derived(solved?.backgrounds.get("page")?.[mode]);
  const pageL = $derived(pageBg?.l ?? (mode === "light" ? 1 : 0));

  // Hierarchy Delta (Surface vs Page)
  const deltaLc = $derived(
    bgL !== null ? Math.round(Math.abs(contrastForPair(pageL, bgL))) : 0,
  );

  // Text Contrast (Safety)
  // Logic from math.ts textLightness
  const textL = $derived(
    polarity === "page" ? (mode === "light" ? 0 : 1) : mode === "light" ? 1 : 0,
  );

  const contrast = $derived(bgL !== null ? contrastForPair(textL, bgL) : 0);
  const score = $derived(Math.round(contrast));

  const status = $derived.by(() => {
    if (score < 45) return "Fail";
    if (score < 60) return "Weak";
    if (score < 75) return "Good";
    return "High";
  });

  const toneClass = $derived.by(() => {
    if (score < 60) return "text-warning";
    return "text-positive";
  });
</script>

{#if surface && computed}
  <div class="badge-group font-mono">
    <!-- Hierarchy Badge (Delta from Page) -->
    <span
      class="hierarchy-badge surface-workspace bordered {toneClass}"
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
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
        <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.25" />
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
