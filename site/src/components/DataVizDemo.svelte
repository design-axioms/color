<script lang="ts">
  import Diagram from "./Diagram.svelte";
  import { onMount } from "svelte";

  let tauValue = "1";
  let localOverride = false;

  onMount(() => {
    console.log("DataVizDemo mounted");
    const updateTau = (): void => {
      if (typeof getComputedStyle === "function") {
        tauValue = getComputedStyle(document.documentElement)
          .getPropertyValue("--tau")
          .trim();
      }
      requestAnimationFrame(updateTau);
    };
    const handle = requestAnimationFrame(updateTau);
    return () => {
      console.log("DataVizDemo unmounted");
      cancelAnimationFrame(handle);
    };
  });

  const barHeights = [60, 85, 40, 95, 55, 70, 30, 80, 45, 65];

  const chartHues = [
    "hue-blue",
    "hue-indigo",
    "hue-brand",
    "hue-success",
    "hue-warning",
    "hue-danger",
    "hue-highlight",
    "hue-info",
    "hue-gray",
    "hue-slider",
  ] as const;
</script>

<div class="docs-col" class:local-dark={localOverride}>
  <div
    class="surface-workspace bordered"
    style="padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;"
  >
    <strong>Debug Controls</strong>
    <div>Current --tau: {tauValue}</div>
    <button on:click={() => (localOverride = !localOverride)}>
      Toggle Local Dark Mode (Bypass Starlight)
    </button>
    <div
      style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;"
    >
      <div
        class="surface-card bordered"
        style="width: 50px; height: 50px;"
      ></div>
      <span>Direct Tau Box (Should animate with Local Toggle)</span>
    </div>
  </div>

  <!-- Swatches -->
  <div class="docs-card">
    <strong class="docs-card-header">Palette Swatches</strong>
    <Diagram>
      <div
        style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 0.5rem;"
      >
        {#each chartHues as hue (hue)}
          <div
            style="display: flex; flex-direction: column; gap: 0.25rem; align-items: center;"
          >
            <div
              class="bordered shadow-sm surface-action-soft {hue}"
              style="width: 100%; aspect-ratio: 1/1; border-radius: 6px;"
            ></div>
            <span class="text-subtle font-mono" style="font-size: 0.7rem;">
              {hue}
            </span>
          </div>
        {/each}
      </div>
    </Diagram>
  </div>

  <!-- Bar Chart -->
  <div class="docs-card">
    <strong class="docs-card-header">Bar Chart Example</strong>
    <div
      style="height: 200px; display: flex; align-items: flex-end; gap: 4px; padding-top: 1rem;"
    >
      {#each barHeights as height, i (i)}
        <div
          class="surface-action {chartHues[i % chartHues.length]}"
          style="flex: 1; height: {height}%; border-radius: 4px 4px 0 0; opacity: 0.9;"
          title={chartHues[i % chartHues.length]}
        ></div>
      {/each}
    </div>
  </div>

  <!-- Pie Chart -->
  <div class="docs-card">
    <strong class="docs-card-header">Pie Chart Example</strong>
    <div style="display: flex; justify-content: center; padding: 1rem;">
      <div
        class="surface-workspace bordered"
        style="padding: 0.75rem; border-radius: 0.75rem;"
      >
        <div
          style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; width: 180px;"
        >
          {#each chartHues.slice(0, 5) as hue (hue)}
            <div
              class="surface-action-soft {hue} bordered"
              style="height: 28px; border-radius: 999px;"
              title={hue}
            ></div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .local-dark {
    --tau: -1;
    transition: --tau 1s ease-in-out;
  }
</style>
