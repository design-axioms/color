<script lang="ts">
  import type { Polarity } from "@axiomatic-design/color/types";
  import { getContext } from "svelte";
  import type { BuilderState } from "../../../lib/state/BuilderState.svelte";
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import { themeState } from "../../../lib/state/ThemeState.svelte";

  const builder = getContext<BuilderState>("builder");
  let mode = $derived(themeState.mode);

  // Polarity Selection
  let polarity = $state<Polarity>("page");
  const polarities: Polarity[] = ["page", "inverted"];

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
    // We need the container's bounding rect to get relative Y
    const container = e.currentTarget as HTMLDivElement;
    const rect = container.getBoundingClientRect();
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

  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="graph-container"
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
    role="application"
    aria-label="Lightness Graph Editor"
  >
    <svg
      {width}
      {height}
      viewBox="0 0 {width} {height}"
      role="img"
      aria-label="Lightness Graph Visualization"
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

      <!-- Start Handle (Visual) -->
      <circle
        cx={padding}
        cy={yScale(start)}
        r="8"
        fill="var(--computed-fg-color)"
      />
      <text
        x={padding + 15}
        y={yScale(start)}
        dominant-baseline="middle"
        font-size="12"
        fill="currentColor">Start: {start.toFixed(2)}</text
      >

      <!-- End Handle (Visual) -->
      <circle
        cx={width - padding}
        cy={yScale(end)}
        r="8"
        fill="var(--computed-fg-color)"
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

    <!-- Interactive Overlay -->
    <div
      class="controls-overlay"
      style:width="{width}px"
      style:height="{height}px"
    >
      <!-- Start Handle Button -->
      <button
        type="button"
        class="control-handle"
        style:left="{padding}px"
        style:top="{yScale(start)}px"
        style:cursor="ns-resize"
        aria-label="Start Anchor"
        onmousedown={() => {
          handleMouseDown("start");
        }}
      ></button>

      <!-- End Handle Button -->
      <button
        type="button"
        class="control-handle"
        style:left="{width - padding}px"
        style:top="{yScale(end)}px"
        style:cursor="ns-resize"
        aria-label="End Anchor"
        onmousedown={() => {
          handleMouseDown("end");
        }}
      ></button>
    </div>
  </div>

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

  .graph-container {
    margin: 1rem 0;
    background: var(--surface-sunken);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .controls-overlay {
    position: absolute;
    top: 0;
    left: 0; /* Centering handled by flex parent if width matches, but here we set explicit width */
    /* Actually, since parent is flex center, and we want overlay to match SVG... */
    /* Better to let the overlay be absolutely positioned relative to container */
    pointer-events: none;
  }

  /* Fix overlay positioning since container is flex-centered */
  /* The SVG has explicit width/height. The overlay should match. */

  .control-handle {
    position: absolute;
    width: 24px;
    height: 24px;
    transform: translate(-50%, -50%);
    background: transparent;
    border: none;
    border-radius: 50%;
    pointer-events: auto;
    padding: 0;
  }

  .control-handle:focus-visible {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
  }

  svg {
    /* background: var(--surface-sunken); moved to container */
    /* border-radius: 8px; moved to container */
    /* margin: 1rem 0; moved to container */
    user-select: none;
    display: block; /* Remove inline spacing */
  }

  .hint {
    font-size: 0.8rem;
    opacity: 0.7;
  }
</style>
