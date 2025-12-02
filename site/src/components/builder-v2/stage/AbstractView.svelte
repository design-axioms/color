<script lang="ts">
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import { themeState } from "../../../lib/state/ThemeState.svelte";
  import type { Polarity } from "@axiomatic-design/color/types";

  let mode = $derived(themeState.mode);
  // Default to 'page' polarity for the main graph
  let polarity: Polarity = "page";

  let anchors = $derived(configState.config.anchors[polarity][mode]);
  let start = $derived(anchors.start.background);
  let end = $derived(anchors.end.background);

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

<div class="abstract-view">
  <h3>Interactive Lightness Graph ({mode})</h3>

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
      stroke="var(--surface-bordered)"
    />
    <line
      x1={padding}
      y1={height - padding}
      x2={width - padding}
      y2={height - padding}
      stroke="var(--surface-bordered)"
    />

    <!-- Curve (Linear for now) -->
    <line
      x1={padding}
      y1={yScale(start)}
      x2={width - padding}
      y2={yScale(end)}
      stroke="var(--text-subtle-token)"
      stroke-width="2"
      stroke-dasharray="4"
    />

    <!-- Start Handle -->
    <circle
      cx={padding}
      cy={yScale(start)}
      r="8"
      fill="var(--text-high-token)"
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
      fill="var(--text-high-token)"
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

  <p class="hint">Drag the points to adjust the anchor lightness.</p>
</div>

<style>
  .abstract-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    color: var(--text-subtle-token);
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
