<script lang="ts">
  const chartColors = Array.from({ length: 10 }, (_, i) => i + 1);
  const barHeights = [60, 85, 40, 95, 55, 70, 30, 80, 45, 65];
</script>

<div class="docs-col">
  <!-- Swatches -->
  <div class="docs-card">
    <strong class="docs-card-header">Palette Swatches</strong>
    <div
      style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 0.5rem;"
    >
      {#each chartColors as i (i)}
        <div
          style="display: flex; flex-direction: column; gap: 0.25rem; align-items: center;"
        >
          <div
            style="background-color: var(--chart-{i}); width: 100%; aspect-ratio: 1/1; border-radius: 6px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-dec-token);"
          ></div>
          <span
            style="font-size: 0.7rem; color: var(--text-subtle-token); font-family: var(--sl-font-mono);"
          >
            {i}
          </span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Bar Chart -->
  <div class="docs-card">
    <strong class="docs-card-header">Bar Chart Example</strong>
    <div
      style="height: 200px; display: flex; align-items: flex-end; gap: 4px; padding-top: 1rem;"
    >
      {#each barHeights as height, i (i)}
        <div
          style="flex: 1; height: {height}%; background-color: var(--chart-{(i %
            10) +
            1}); border-radius: 4px 4px 0 0; opacity: 0.9;"
          title="--chart-{(i % 10) + 1}"
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
            var(--chart-1) 0% 20%,
            var(--chart-2) 20% 35%,
            var(--chart-3) 35% 55%,
            var(--chart-4) 55% 80%,
            var(--chart-5) 80% 100%
          ); box-shadow: var(--shadow-md); border: 1px solid var(--border-dec-token);"
      ></div>
    </div>
  </div>
</div>
