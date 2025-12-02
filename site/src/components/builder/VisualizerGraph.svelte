<script lang="ts">
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";

  const configState = getContext<ConfigState>("config");
  const themeState = getContext<ThemeState>("theme");

  let config = $derived(configState.config);

  let solved = $derived(configState.solved);
  let mode = $derived(themeState.mode);

  let dataPoints = $derived.by(() => {
    if (!solved) return [];
    const points: {
      x: number;
      y: number;
      name: string;
      slug: string;
      group: string;
    }[] = [];
    let index = 0;
    for (const group of config.groups) {
      for (const surface of group.surfaces) {
        const bg = solved.backgrounds.get(surface.slug)?.[mode] as
          | { l: number }
          | undefined;
        if (bg) {
          points.push({
            x: index,
            y: bg.l, // 0-1
            name: surface.name,
            slug: surface.slug,
            group: group.name,
          });
        }
        index++;
      }
    }
    return points;
  });

  let width = 800;
  let height = 400;
  let padding = 40;

  function xScale(index: number, total: number): number {
    if (total <= 1) return padding;
    return padding + (index / (total - 1)) * (width - 2 * padding);
  }

  function yScale(lightness: number): number {
    // Invert Y because SVG 0 is top
    return height - padding - lightness * (height - 2 * padding);
  }

  let pathD = $derived.by(() => {
    if (dataPoints.length === 0) return "";
    const points = dataPoints.map((p, i) => {
      const x = xScale(i, dataPoints.length);
      const y = yScale(p.y);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  });
</script>

<div class="graph-view">
  <div class="header">
    <h3>Lightness Curve ({mode})</h3>
    <p class="text-subtle">
      Visualizing surface lightness progression across nesting levels.
    </p>
  </div>

  <div class="chart-container">
    <svg {width} {height} viewBox="0 0 {width} {height}">
      <!-- Grid Lines -->
      {#each [0, 0.25, 0.5, 0.75, 1] as l (l)}
        <line
          x1={padding}
          y1={yScale(l)}
          x2={width - padding}
          y2={yScale(l)}
          stroke="var(--color-border)"
          stroke-dasharray="4"
        />
        <text
          x={padding - 10}
          y={yScale(l)}
          dominant-baseline="middle"
          text-anchor="end"
          font-size="10"
          fill="var(--color-fg-subtle)"
        >
          {l}
        </text>
      {/each}

      <!-- X Axis Labels -->
      {#each dataPoints as p, i (p.slug)}
        <text
          x={xScale(i, dataPoints.length)}
          y={height - padding + 20}
          text-anchor="middle"
          font-size="10"
          fill="var(--color-fg-subtle)"
          transform="rotate(45, {xScale(i, dataPoints.length)}, {height -
            padding +
            20})"
        >
          {p.name}
        </text>
      {/each}

      <!-- Line -->
      <path
        d={pathD}
        fill="none"
        stroke="var(--color-fg-strong)"
        stroke-width="2"
      />

      <!-- Points -->
      {#each dataPoints as p, i (p.slug)}
        <circle
          cx={xScale(i, dataPoints.length)}
          cy={yScale(p.y)}
          r="4"
          fill="var(--color-{p.slug}-bg)"
          stroke="var(--color-border)"
          stroke-width="1"
        >
          <title>{p.name}: {p.y.toFixed(3)}</title>
        </circle>
      {/each}
    </svg>
  </div>

  <div class="legend">
    <div class="legend-item">
      <span class="axis-label">Y-Axis:</span> Lightness (0-1)
    </div>
    <div class="legend-item">
      <span class="axis-label">X-Axis:</span> Nesting Level / Surface Sequence
    </div>
  </div>
</div>

<style>
  .graph-view {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    height: 100%;
    overflow-y: auto;
  }

  .header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-fg-strong);
    margin-bottom: 0.5rem;
  }

  .chart-container {
    background: var(--color-surface-100);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    justify-content: center;
    overflow-x: auto;
  }

  .legend {
    display: flex;
    gap: 2rem;
    font-size: 0.875rem;
    color: var(--color-fg-subtle);
  }

  .axis-label {
    font-weight: 600;
    color: var(--color-fg-strong);
  }
</style>
