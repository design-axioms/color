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

  const chartColors = Array.from({ length: 10 }, (_, i) => i + 1);
  const barHeights = [60, 85, 40, 95, 55, 70, 30, 80, 45, 65];
</script>

<div class="docs-col" class:local-dark={localOverride}>
  <div style="padding: 1rem; border: 1px solid red; margin-bottom: 1rem;">
    <strong>Debug Controls</strong>
    <div>Current --tau: {tauValue}</div>
    <button on:click={() => (localOverride = !localOverride)}>
      Toggle Local Dark Mode (Bypass Starlight)
    </button>
    <div
      style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;"
    >
      <div
        style="width: 50px; height: 50px; background: oklch(0.5 0.2 calc(180 + (180 * var(--tau)))); border: 1px solid black;"
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
        {#each chartColors as i (i)}
          <div
            style="display: flex; flex-direction: column; gap: 0.25rem; align-items: center;"
          >
            <div
              style="background-color: var(--axm-chart-{i}); width: 100%; aspect-ratio: 1/1; border-radius: 6px; box-shadow: var(--shadow-sm); border: 1px solid var(--axm-border-dec-token);"
            ></div>
            <span class="text-subtle font-mono" style="font-size: 0.7rem;">
              {i}
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
          style="flex: 1; height: {height}%; background-color: var(--axm-chart-{(i %
            10) +
            1}); border-radius: 4px 4px 0 0; opacity: 0.9;"
          title="--axm-chart-{(i % 10) + 1}"
        ></div>
      {/each}
    </div>
  </div>

  <!-- Pie Chart -->
  <div class="docs-card">
    <strong class="docs-card-header">Pie Chart Example</strong>
    <div style="display: flex; justify-content: center; padding: 1rem;">
      <div
        style="width: 180px; height: 180px; border-radius: 50%; background: conic-gradient(
            var(--axm-chart-1) 0% 20%,
            var(--axm-chart-2) 20% 35%,
            var(--axm-chart-3) 35% 55%,
            var(--axm-chart-4) 55% 80%,
            var(--axm-chart-5) 80% 100%
          ); box-shadow: var(--shadow-md); border: 1px solid var(--axm-border-dec-token);"
      ></div>
    </div>
  </div>
</div>

<style>
  .local-dark {
    --tau: -1;
    transition: --tau 1s ease-in-out;
  }
</style>
