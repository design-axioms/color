<script lang="ts">
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";

  const configState = getContext<ConfigState>("config");

  let config = $derived(configState.config);

  let dragging = $state<{
    polarity: "page" | "inverted";
    mode: "light" | "dark";
    handle: "start" | "end" | "range";
    startX: number;
    initialStart: number;
    initialEnd: number;
  } | null>(null);

  function handlePointerDown(
    e: PointerEvent,
    polarity: "page" | "inverted",
    mode: "light" | "dark",
    handle: "start" | "end" | "range",
    currentStart: number,
    currentEnd: number,
  ): void {
    e.preventDefault();
    e.stopPropagation();
    dragging = {
      polarity,
      mode,
      handle,
      startX: e.clientX,
      initialStart: currentStart,
      initialEnd: currentEnd,
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function handlePointerMove(e: PointerEvent): void {
    if (!dragging) return;

    // Find the correct track container based on polarity
    const track = document.querySelector(`.track-${dragging.polarity}`);
    if (!track) return;

    const rect = track.getBoundingClientRect();

    if (dragging.handle === "range") {
      const deltaX = (e.clientX - dragging.startX) / rect.width;
      let newStart = dragging.initialStart + deltaX;
      let newEnd = dragging.initialEnd + deltaX;

      // Clamp to 0-1 while maintaining range width
      if (newStart < 0) {
        newEnd += 0 - newStart;
        newStart = 0;
      }
      if (newEnd > 1) {
        newStart -= newEnd - 1;
        newEnd = 1;
      }
      // Safety check if range is somehow > 1
      if (newStart < 0) newStart = 0;
      if (newEnd > 1) newEnd = 1;

      configState.updateAnchor(
        dragging.polarity,
        dragging.mode,
        "start",
        newStart,
      );
      configState.updateAnchor(dragging.polarity, dragging.mode, "end", newEnd);
    } else {
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      configState.updateAnchor(
        dragging.polarity,
        dragging.mode,
        dragging.handle,
        x,
      );
    }
  }

  function handlePointerUp(): void {
    dragging = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  function getStyle(start: number, end: number): string {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    return `left: ${min * 100}%; width: ${(max - min) * 100}%;`;
  }

  let { showPage = true, showInverted = true } = $props();
</script>

<div class="context-graph-wrapper">
  <!-- Page Context Section -->
  {#if showPage}
    <div class="context-section">
      <div class="section-header">
        <div class="title-group">
          <h3 class="text-strong">Page Context</h3>
          <p class="text-subtle">The primary background and surface range.</p>
        </div>
        <div class="controls">
          <label class="sync-toggle">
            <input type="checkbox" bind:checked={configState.syncDark} />
            <span class="text-subtle">Sync Dark Mode</span>
            {#if configState.syncDark}
              <span title="Dark Mode is derived from Light Mode contrast"
                >🔒</span
              >
            {:else}
              <span title="Dark Mode is independent">🔓</span>
            {/if}
          </label>
        </div>
      </div>

      <div class="track-container">
        <div class="track-axis text-subtle font-mono">
          <span>0% (Black)</span>
          <span class="axis-label">Lightness</span>
          <span>100% (White)</span>
        </div>

        <div class="graph-track track-page">
          <div class="lightness-gradient"></div>

          <!-- Page Light Range -->
          <!-- eslint-disable @typescript-eslint/no-confusing-void-expression -->
          {@render Range(
            "page",
            "light",
            config.anchors.page.light.start.background,
            config.anchors.page.light.end.background,
            "hue-info",
            "Light Mode",
          )}
          <!-- eslint-enable @typescript-eslint/no-confusing-void-expression -->

          <!-- Page Dark Range -->
          <!-- eslint-disable @typescript-eslint/no-confusing-void-expression -->
          {@render Range(
            "page",
            "dark",
            config.anchors.page.dark.start.background,
            config.anchors.page.dark.end.background,
            "hue-brand",
            "Dark Mode",
            configState.syncDark,
          )}
          <!-- eslint-enable @typescript-eslint/no-confusing-void-expression -->
        </div>
      </div>
    </div>
  {/if}

  <!-- Inverted Context Section -->
  {#if showInverted}
    <div class="context-section">
      <div class="section-header">
        <div class="title-group">
          <h3 class="text-strong">Inverted Context</h3>
          <p class="text-subtle">
            High-contrast surfaces (like tooltips or dark sidebars).
          </p>
        </div>
      </div>

      <div class="track-container">
        <div class="track-axis text-subtle font-mono">
          <span>0%</span>
          <span class="axis-label">Lightness</span>
          <span>100%</span>
        </div>

        <div class="graph-track track-inverted">
          <div class="lightness-gradient"></div>

          <!-- Inverted Light Range -->
          <!-- eslint-disable @typescript-eslint/no-confusing-void-expression -->
          {@render Range(
            "inverted",
            "light",
            config.anchors.inverted.light.start.background,
            config.anchors.inverted.light.end.background,
            "hue-warning",
            "Light Mode",
          )}
          <!-- eslint-enable @typescript-eslint/no-confusing-void-expression -->

          <!-- Inverted Dark Range -->
          <!-- eslint-disable @typescript-eslint/no-confusing-void-expression -->
          {@render Range(
            "inverted",
            "dark",
            config.anchors.inverted.dark.start.background,
            config.anchors.inverted.dark.end.background,
            "hue-error",
            "Dark Mode",
            configState.syncDark,
          )}
          <!-- eslint-enable @typescript-eslint/no-confusing-void-expression -->
        </div>
      </div>
    </div>
  {/if}
</div>

{#snippet Range(
  polarity: "page" | "inverted",
  mode: "light" | "dark",
  start: number,
  end: number,
  hueClass: string,
  label: string,
  disabled = false,
)}
  {@const style = getStyle(start, end)}
  {@const isActive = dragging?.polarity === polarity && dragging.mode === mode}

  <!-- Range Container -->
  <div
    class="range-group {isActive ? 'dragging' : ''} {disabled
      ? 'disabled'
      : ''} {mode}"
    {style}
  >
    <!-- Label (Above/Below based on mode to avoid collision) -->
    <div class="range-label {mode} font-mono">
      <span class="mode-badge surface-action {hueClass}"
        >{mode === "light" ? "L" : "D"}</span
      >
      <span class="range-values text-subtle"
        >{start.toFixed(2)} - {end.toFixed(2)}</span
      >
    </div>

    <!-- The Bar itself -->
    <button
      class="bar-fill surface-action {hueClass}"
      type="button"
      onpointerdown={(e) => {
        if (!disabled)
          handlePointerDown(e, polarity, mode, "range", start, end);
      }}
      aria-label="{label} Range"
      aria-disabled={disabled}
    ></button>

    <!-- Handles -->
    <button
      class="bar-handle start surface-action {hueClass}"
      type="button"
      style="left: {start <= end ? '0%' : '100%'}"
      onpointerdown={(e) => {
        if (!disabled)
          handlePointerDown(e, polarity, mode, "start", start, end);
      }}
      aria-label="{label} Start"
      aria-disabled={disabled}
    ></button>

    <button
      class="bar-handle end surface-action {hueClass}"
      type="button"
      style="left: {start <= end ? '100%' : '0%'}"
      onpointerdown={(e) => {
        if (!disabled) handlePointerDown(e, polarity, mode, "end", start, end);
      }}
      aria-label="{label} End"
      aria-disabled={disabled}
    ></button>
  </div>
{/snippet}

<style>
  .context-graph-wrapper {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding: 1rem 0;
    user-select: none;
  }

  .context-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title-group h3 {
    margin: 0;
    font-size: 1rem;
  }

  .title-group p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
  }

  .sync-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .track-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .track-axis {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    padding: 0 2px;
  }

  .axis-label {
    text-transform: uppercase;
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    opacity: 0.7;
  }

  .graph-track {
    position: relative;
    height: 60px; /* Taller track to accommodate stacked bars */
    display: flex;
    align-items: center;
    margin-top: 1rem;
  }

  .lightness-gradient {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 8px;
    background: linear-gradient(to right, black, white);
    border-radius: 4px;
    border: 1px solid var(--computed-border-dec-color);
    z-index: 1;
  }

  .range-group {
    position: absolute;
    height: 100%;
    pointer-events: none;
    top: 0;
    z-index: 2;
    transition: opacity 0.2s;
  }

  .range-group.disabled {
    opacity: 0.4;
    filter: grayscale(1);
  }

  /* Offset Light and Dark modes vertically */
  .range-group.light .bar-fill {
    top: 35%; /* Above center */
  }

  .range-group.dark .bar-fill {
    top: 65%; /* Below center */
  }

  .range-group.light .bar-handle {
    top: 35%;
  }

  .range-group.dark .bar-handle {
    top: 65%;
  }

  .bar-fill {
    position: absolute;
    transform: translateY(-50%);
    left: 0;
    right: 0;
    height: 6px;
    /* background-color: var(--range-color); */
    border-radius: 3px;
    opacity: 0.9;
    box-shadow: 0 0 0 1px var(--computed-bg-color);
    cursor: grab;
    pointer-events: auto;
    /* Button Reset */
    appearance: none;
    border: none;
    padding: 0;
  }

  .bar-handle {
    position: absolute;
    width: 14px;
    height: 14px;
    /* background-color: var(--computed-bg-color); */
    /* border: 2px solid var(--range-color); */
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: col-resize;
    pointer-events: auto;
    z-index: 10;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.1s;
    /* Button Reset */
    appearance: none;
    padding: 0;
  }

  .bar-handle:hover {
    transform: translate(-50%, -50%) scale(1.2);
    z-index: 11;
  }

  /* Labels */
  .range-label {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    white-space: nowrap;
    left: 50%;
    transform: translateX(-50%);
  }

  .range-label.light {
    top: -5px;
  }

  .range-label.dark {
    bottom: -5px;
  }

  .mode-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    /* color: white; */
    font-weight: bold;
    font-size: 0.6rem;
  }
</style>
