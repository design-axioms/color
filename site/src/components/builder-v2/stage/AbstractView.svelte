<script lang="ts">
  import { getContext } from "svelte";
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import { themeState } from "../../../lib/state/ThemeState.svelte";
  import type { BuilderState } from "../../../lib/state/BuilderState.svelte";
  import type { Polarity } from "@axiomatic-design/color/types";

  const builder = getContext<BuilderState>("builder");
  let mode = $derived(themeState.mode);

  // Polarity Selection
  let polarity = $state<Polarity>("page");
  const polarities: Polarity[] = ["page", "inverted", "action"];

  let anchors = $derived(configState.config.anchors[polarity][mode]);
  let start = $derived(anchors.start.background);
  let end = $derived(anchors.end.background);

  // Selected Surface Visualization
  let selectedSurfaceId = $derived(builder.selectedSurfaceId);
  let selectedSurfaceL = $derived.by(() => {
    if (!selectedSurfaceId || !configState.solved) return null;
    const bg = configState.solved.backgrounds.get(selectedSurfaceId);
    if (!bg) return null;
    // Check if the surface actually belongs to the current polarity?
    // For now, just show its lightness regardless, as a reference.
    return mode === "light" ? bg.light.l : bg.dark.l;
  });

  let width = 600;
  let height = 300;
  let padding = 40;

  function yScale(l: number): number {
    return height - padding - l * (height - 2 * padding);
  }

  function yToLightness(y: number): number {
    const range = height - 2 * padding;
    const val = (height - padding - y) / range;
    return Math.max(0, Math.min(1, val));
  }

  let isDragging = $state<"start" | "end" | null>(null);

  function handleMouseDown(type: "start" | "end"): void {
    isDragging = type;
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!isDragging) return;

    // Calculate new lightness from Y position
    // We need the SVG's bounding rect to get relative Y
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const l = yToLightness(y);

    configState.updateAnchor(polarity, mode, isDragging, l);
  }

  function handleMouseUp(): void {
    isDragging = null;
  }
</script>

<div class="abstract-view text-subtle">
  <div class="header">
    <h3>Interactive Lightness Graph ({mode})</h3>
    <div class="polarity-tabs">
      {#each polarities as p (p)}
        <button
          class:active={polarity === p}
          class="text-subtle"
          onclick={() => (polarity = p)}
        >
          {p}
        </button>
      {/each}
    </div>
  </div>

  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    role="application"
  >
    <!-- Grid -->
    <line
      x1={padding}
      y1={padding}
      x2={padding}
      y2={height - padding}
      stroke="var(--computed-border-dec-color)"
    />
    <line
      x1={padding}
      y1={height - padding}
      x2={width - padding}
      y2={height - padding}
      stroke="var(--computed-border-dec-color)"
    />

    <!-- Curve (Linear for now) -->
    <line
      x1={padding}
      y1={yScale(start)}
      x2={width - padding}
      y2={yScale(end)}
      stroke="currentColor"
      stroke-width="2"
      stroke-dasharray="4"
    />

    <!-- Selected Surface Line -->
    {#if selectedSurfaceL !== null}
      <line
        x1={padding}
        y1={yScale(selectedSurfaceL)}
        x2={width - padding}
        y2={yScale(selectedSurfaceL)}
        stroke="var(--text-link)"
        stroke-width="2"
      />
      <text
        x={width / 2}
        y={yScale(selectedSurfaceL) - 8}
        text-anchor="middle"
        font-size="12"
        fill="var(--text-link)"
        font-weight="bold"
      >
        {selectedSurfaceId} ({selectedSurfaceL.toFixed(2)})
      </text>
    {/if}

    <!-- Start Handle -->
    <circle
      cx={padding}
      cy={yScale(start)}
      r="8"
      fill="var(--computed-fg-color)"
      cursor="ns-resize"
      onmousedown={() => {
        handleMouseDown("start");
      }}
    />
    <text
      x={padding + 15}
      y={yScale(start)}
      dominant-baseline="middle"
      font-size="12"
      fill="currentColor">Start: {start.toFixed(2)}</text
    >

    <!-- End Handle -->
    <circle
      cx={width - padding}
      cy={yScale(end)}
      r="8"
      fill="var(--computed-fg-color)"
      cursor="ns-resize"
      onmousedown={() => {
        handleMouseDown("end");
      }}
    />
    <text
      x={width - padding - 15}
      y={yScale(end)}
      text-anchor="end"
      dominant-baseline="middle"
      font-size="12"
      fill="currentColor">End: {end.toFixed(2)}</text
    >
  </svg>

  <p class="hint">
    Drag the points to adjust the anchor lightness for <strong
      >{polarity}</strong
    > surfaces.
  </p>
</div>

<style>
  .abstract-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .polarity-tabs {
    display: flex;
    gap: 0.5rem;
    background: var(--surface-sunken);
    padding: 0.25rem;
    border-radius: 4px;
  }

  .polarity-tabs button {
    background: none;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 2px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .polarity-tabs button.active {
    background: var(--surface-card);
    color: var(--computed-fg-color);
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  svg {
    background: var(--surface-sunken);
    border-radius: 8px;
    margin: 1rem 0;
    user-select: none;
  }

  .hint {
    font-size: 0.8rem;
    opacity: 0.7;
  }
</style>
