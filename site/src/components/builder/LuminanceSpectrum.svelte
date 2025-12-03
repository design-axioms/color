<script lang="ts">
  import { getContext } from "svelte";
  import { contrastForPair } from "@axiomatic-design/color";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import RangeSlider from "./RangeSlider.svelte";

  const configState = getContext<ConfigState>("config");
  let config = $derived(configState.config);

  // Dark Mode: Surface (Start) -> Ink (End)
  let darkSurface = $derived(config.anchors.page.dark.start.background);
  let darkInk = $derived(config.anchors.page.dark.end.background);

  // Light Mode: Ink (End) -> Surface (Start)
  // Note: In Light Mode, Ink is darker (lower L*) than Surface.
  // So Ink corresponds to the "start" of the range slider (min value),
  // and Surface corresponds to the "end" of the range slider (max value).
  let lightInk = $derived(config.anchors.page.light.end.background);
  let lightSurface = $derived(config.anchors.page.light.start.background);

  let darkContrast = $derived(contrastForPair(darkSurface, darkInk));
  let lightContrast = $derived(contrastForPair(lightSurface, lightInk));

  function getContrastColor(ratio: number): string {
    if (ratio >= 75) return "var(--hue-success)"; // AAA / APCA 75+
    if (ratio >= 60) return "var(--hue-warning)"; // AA / APCA 60+
    return "var(--hue-error)"; // Fail
  }

  function handleDarkChange(start: number, end: number): void {
    // Dark Mode: Start is Surface, End is Ink
    // Constraint: Surface < Ink (handled by RangeSlider min<=max)
    // Constraint: Dark Ink < Light Ink (Soft constraint, but good to check)

    configState.updateAnchor("page", "dark", "start", start);
    configState.updateAnchor("page", "dark", "end", end);
  }

  function handleLightChange(start: number, end: number): void {
    // Light Mode: Start is Ink, End is Surface
    // Constraint: Ink < Surface (handled by RangeSlider min<=max)

    configState.updateAnchor("page", "light", "end", start);
    configState.updateAnchor("page", "light", "start", end);
  }
</script>

<div class="luminance-spectrum-container">
  <div class="header">
    <h3 class="text-strong">Luminance Spectrum (L*)</h3>
    <div class="controls">
      <label class="sync-toggle">
        <input type="checkbox" bind:checked={configState.syncDark} />
        <span class="text-subtle">Sync Dark Mode</span>
        {#if configState.syncDark}
          <span title="Dark Mode is derived from Light Mode contrast">🔒</span>
        {:else}
          <span title="Dark Mode is independent">🔓</span>
        {/if}
      </label>
    </div>
  </div>

  <div class="spectrum-track-wrapper">
    <!-- Axis Labels -->
    <div class="axis-labels text-subtle font-mono">
      <span>0% (Black)</span>
      <span>100% (White)</span>
    </div>

    <!-- The Track -->
    <div class="spectrum-track">
      <!-- Gradient Background -->
      <div class="gradient-bg"></div>

      <!-- Dark Mode Slider -->
      <div class="slider-layer dark-layer">
        <RangeSlider
          start={darkSurface}
          end={darkInk}
          label="Dark Mode"
          fillClass="surface-action hue-brand"
          handleClass="surface-action hue-brand"
          onChange={handleDarkChange}
          disabled={configState.syncDark}
        />
        <!-- Contrast Badge (Below) -->
        <div
          class="contrast-badge dark font-mono"
          style="left: {((darkSurface + darkInk) / 2) * 100}%"
        >
          <span style="color: {getContrastColor(darkContrast)}"
            >Lc {darkContrast.toFixed(1)}</span
          >
        </div>
      </div>

      <!-- Light Mode Slider -->
      <div class="slider-layer light-layer">
        <RangeSlider
          start={lightInk}
          end={lightSurface}
          label="Light Mode"
          fillClass="surface-action hue-info"
          handleClass="surface-action hue-info"
          onChange={handleLightChange}
        />
        <!-- Contrast Badge (Above) -->
        <div
          class="contrast-badge light font-mono"
          style="left: {((lightInk + lightSurface) / 2) * 100}%"
        >
          <span style="color: {getContrastColor(lightContrast)}"
            >Lc {lightContrast.toFixed(1)}</span
          >
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .luminance-spectrum-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .sync-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .spectrum-track-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .axis-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
  }

  .spectrum-track {
    position: relative;
    height: 60px;
    background: var(--surface-2);
    border-radius: 6px;
    /* border: 1px solid var(--border-subtle); */
  }

  .gradient-bg {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 8px;
    transform: translateY(-50%);
    background: linear-gradient(to right, black, white);
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 0;
  }

  .slider-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Let events pass through to RangeSlider elements */
  }

  /* Make RangeSlider children interactive */
  .slider-layer :global(.range-slider) {
    pointer-events: none;
  }
  .slider-layer :global(.range-fill),
  .slider-layer :global(.handle) {
    pointer-events: auto;
  }

  /* Offset layers vertically to avoid handle collision */
  .dark-layer {
    z-index: 1;
  }
  .dark-layer :global(.range-fill),
  .dark-layer :global(.handle) {
    top: 65% !important; /* Override RangeSlider default */
  }

  .light-layer {
    z-index: 2;
  }
  .light-layer :global(.range-fill),
  .light-layer :global(.handle) {
    top: 35% !important; /* Override RangeSlider default */
  }

  .contrast-badge {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.7rem;
    background: var(--surface-1);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--border-subtle);
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
  }

  .contrast-badge.light {
    top: 5px;
  }

  .contrast-badge.dark {
    bottom: 5px;
  }
</style>
