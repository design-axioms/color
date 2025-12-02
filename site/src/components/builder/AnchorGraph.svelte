<script lang="ts">
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";

  const configState = getContext<ConfigState>("config");
  const themeState = getContext<ThemeState>("theme");

  let config = $derived(configState.config);
  let resolvedTheme = $derived(themeState.mode);

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
</script>

<div class="anchor-graph-wrapper">
  <!-- Page Context Track -->
  <div class="track-section">
    <div class="track-header">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span class="track-title">Page Context</span>
        {#if configState.syncDark}
          <span
            title="Dark Mode Synced"
            style="font-size: 0.8rem; cursor: help;">🔒</span
          >
        {/if}
      </div>
      <div class="track-values">
        <div class="value-pair">
          <span class="label">Light</span>
          <div class="nums">
            <span>{config.anchors.page.light.start.background.toFixed(2)}</span>
            <span class="dash">–</span>
            <span>{config.anchors.page.light.end.background.toFixed(2)}</span>
          </div>
        </div>
        <div class="value-pair">
          <span class="label">Dark</span>
          <div class="nums">
            <span>{config.anchors.page.dark.start.background.toFixed(2)}</span>
            <span class="dash">–</span>
            <span>{config.anchors.page.dark.end.background.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="track-axis">
      <span>0%</span>
      <span class="axis-label">Lightness</span>
      <span>100%</span>
    </div>

    <div class="anchor-graph-track track-page">
      <div class="lightness-gradient"></div>

      <!-- Page Light -->
      <!-- eslint-disable @typescript-eslint/no-confusing-void-expression -->
      {@render Range(
        "page",
        "light",
        config.anchors.page.light.start.background,
        config.anchors.page.light.end.background,
        "var(--hue-info)",
        "Light Mode",
      )}
      <!-- eslint-enable @typescript-eslint/no-confusing-void-expression -->

      <!-- Page Dark -->
      <!-- eslint-disable @typescript-eslint/no-confusing-void-expression -->
      {@render Range(
        "page",
        "dark",
        config.anchors.page.dark.start.background,
        config.anchors.page.dark.end.background,
        "var(--hue-purple)",
        "Dark Mode",
        configState.syncDark,
      )}
      <!-- eslint-enable @typescript-eslint/no-confusing-void-expression -->
    </div>
  </div>

  <!-- Inverted Context Track -->
  <div class="track-section">
    <div class="track-header">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span class="track-title">Inverted Context</span>
        {#if configState.syncDark}
          <span
            title="Dark Mode Synced"
            style="font-size: 0.8rem; cursor: help;">🔒</span
          >
        {/if}
      </div>
      <div class="track-values">
        <div class="value-pair">
          <span class="label">Light</span>
          <div class="nums">
            <span
              >{config.anchors.inverted.light.start.background.toFixed(2)}</span
            >
            <span class="dash">–</span>
            <span
              >{config.anchors.inverted.light.end.background.toFixed(2)}</span
            >
          </div>
        </div>
        <div class="value-pair">
          <span class="label">Dark</span>
          <div class="nums">
            <span
              >{config.anchors.inverted.dark.start.background.toFixed(2)}</span
            >
            <span class="dash">–</span>
            <span>{config.anchors.inverted.dark.end.background.toFixed(2)}</span
            >
          </div>
        </div>
      </div>
    </div>

    <div class="track-axis">
      <span>0%</span>
      <span class="axis-label">Lightness</span>
      <span>100%</span>
    </div>

    <div class="anchor-graph-track track-inverted">
      <div class="lightness-gradient"></div>

      <!-- Inverted Light -->
      <!-- eslint-disable @typescript-eslint/no-confusing-void-expression -->
      {@render Range(
        "inverted",
        "light",
        config.anchors.inverted.light.start.background,
        config.anchors.inverted.light.end.background,
        "var(--hue-warning)",
        "Light Mode",
      )}
      <!-- eslint-enable @typescript-eslint/no-confusing-void-expression -->

      <!-- Inverted Dark -->
      <!-- eslint-disable @typescript-eslint/no-confusing-void-expression -->
      {@render Range(
        "inverted",
        "dark",
        config.anchors.inverted.dark.start.background,
        config.anchors.inverted.dark.end.background,
        "var(--hue-error)",
        "Dark Mode",
        configState.syncDark,
      )}
      <!-- eslint-enable @typescript-eslint/no-confusing-void-expression -->
    </div>
  </div>
</div>

{#snippet Range(
  polarity: "page" | "inverted",
  mode: "light" | "dark",
  start: number,
  end: number,
  color: string,
  label: string,
  disabled = false,
)}
  {@const style = getStyle(start, end)}
  {@const isActive = dragging?.polarity === polarity && dragging.mode === mode}
  {@const isCurrentMode = mode === resolvedTheme}

  <div
    class="range-bar {isActive ? 'dragging' : ''} {disabled ? 'disabled' : ''}"
    style="{style} --range-color: {color}; opacity: {disabled
      ? 0.4
      : isCurrentMode
        ? 1
        : 0.6}; {disabled ? 'pointer-events: none;' : ''}"
  >
    <!-- The Bar itself -->
    <div
      class="bar-fill"
      onpointerdown={(e) => {
        if (!disabled)
          handlePointerDown(e, polarity, mode, "range", start, end);
      }}
      role="slider"
      tabindex={disabled ? -1 : 0}
      aria-label="{label} Range"
      aria-valuenow={start}
      aria-disabled={disabled}
    ></div>

    <!-- Label -->
    <!-- <div class="bar-label" style="color: {color}">
      {label} <span style="opacity: 0.8; font-weight: 400;">{start.toFixed(2)} → {end.toFixed(2)}</span>
    </div> -->

    <!-- Handles -->
    <div
      class="bar-handle start"
      style="left: {start <= end ? '0%' : '100%'}"
      onpointerdown={(e) => {
        if (!disabled)
          handlePointerDown(e, polarity, mode, "start", start, end);
      }}
      role="slider"
      tabindex={disabled ? -1 : 0}
      aria-label="{label} Start"
      aria-valuenow={start}
      aria-disabled={disabled}
    ></div>

    <div
      class="bar-handle end"
      style="left: {start <= end ? '100%' : '0%'}"
      onpointerdown={(e) => {
        if (!disabled) handlePointerDown(e, polarity, mode, "end", start, end);
      }}
      role="slider"
      tabindex={disabled ? -1 : 0}
      aria-label="{label} End"
      aria-valuenow={end}
      aria-disabled={disabled}
    ></div>
  </div>
{/snippet}

<style>
  .anchor-graph-wrapper {
    display: flex;
    flex-direction: column;
    gap: 3.5rem;
    padding: 1rem 0;
    user-select: none;
  }

  .track-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .track-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2px;
    margin-bottom: 0.25rem;
  }

  .track-values {
    display: flex;
    gap: 1.5rem;
  }

  .value-pair {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .value-pair .label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-subtle-token);
    font-weight: 600;
  }

  .nums {
    font-family: var(--font-mono-token);
    font-size: 0.75rem;
    color: var(--text-token);
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-variant-numeric: tabular-nums;
  }

  .dash {
    color: var(--text-subtle-token);
    opacity: 0.6;
  }

  .track-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-token);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .track-axis {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--text-subtle-token);
    font-family: var(--font-mono-token);
    padding: 0 2px;
  }

  .axis-label {
    text-transform: uppercase;
    font-size: 0.65rem;
    letter-spacing: 0.05em;
    opacity: 0.7;
  }

  .anchor-graph-track {
    position: relative;
    height: 32px;
    display: flex;
    align-items: center;
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
    border: 1px solid var(--border-subtle-token);
    z-index: 1;
  }

  .range-bar {
    position: absolute;
    height: 100%;
    pointer-events: none; /* Allow clicks to pass through, handles catch them */
    top: 0;
    z-index: 2;
  }

  .bar-fill {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    right: 0;
    height: 4px;
    background-color: var(--range-color);
    border-radius: 2px;
    opacity: 0.9;
    box-shadow: 0 0 0 1px var(--bg-token);
  }

  /* Handles */
  .bar-handle {
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    background-color: var(--surface-token, white);
    border: 2px solid var(--range-color);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: col-resize;
    pointer-events: auto;
    z-index: 10;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.1s;
  }

  .bar-handle:hover {
    transform: translate(-50%, -50%) scale(1.2);
    z-index: 11;
  }

  .range-bar.dragging .bar-handle {
    transform: translate(-50%, -50%) scale(1.2);
    z-index: 20;
  }

  .range-bar.dragging .bar-fill {
    height: 8px;
    opacity: 1;
  }
</style>
