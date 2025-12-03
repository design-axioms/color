<script lang="ts">
  import { getContext } from "svelte";
  import { converter } from "culori";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import RangeSlider from "./RangeSlider.svelte";

  const configState = getContext<ConfigState>("config");
  let config = configState.config;

  // Dark Mode: Surface (Start) -> Ink (End)
  let darkSurface = $derived(config.anchors.page.dark.start.background);
  let darkInk = $derived(config.anchors.page.dark.end.background);

  // Light Mode: Ink (End) -> Surface (Start)
  let lightInk = $derived(config.anchors.page.light.end.background);
  let lightSurface = $derived(config.anchors.page.light.start.background);

  // WCAG Contrast Calculation
  const toRgb = converter("rgb");

  function getWCAGContrast(l1: number, l2: number): number {
    function getLuminance(l: number): number {
      const rgb = toRgb({ mode: "oklch", l: l, c: 0, h: 0 });
      const { r, g, b } = rgb;
      const sRGB = [r, g, b].map((c) => {
        if (c <= 0.03928) {
          return c / 12.92;
        } else {
          return Math.pow((c + 0.055) / 1.055, 2.4);
        }
      });
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }

    const lum1 = getLuminance(l1);
    const lum2 = getLuminance(l2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  let darkContrast = $derived(getWCAGContrast(darkSurface, darkInk));
  let lightContrast = $derived(getWCAGContrast(lightSurface, lightInk));

  function getFillClass(ratio: number): string {
    if (ratio >= 7) return "surface-action hue-success"; // AAA
    if (ratio >= 4.5) return "surface-action hue-warning"; // AA
    return "surface-action hue-error"; // Fail
  }

  function getContrastColorClass(ratio: number): string {
    if (ratio >= 7) return "text-success";
    if (ratio >= 4.5) return "text-warning";
    return "text-error";
  }

  function handleDarkChange(start: number, end: number): void {
    configState.updateAnchor("page", "dark", "start", start);
    configState.updateAnchor("page", "dark", "end", end);
  }

  function handleLightChange(start: number, end: number): void {
    configState.updateAnchor("page", "light", "end", start);
    configState.updateAnchor("page", "light", "start", end);
  }
</script>

<div class="luminance-spectrum-container">
  <div class="header">
    <h3 class="text-strong">Luminance Spectrum (L*)</h3>
  </div>

  <div class="spectrum-track-wrapper">
    <!-- Axis Labels -->
    <div class="axis-labels text-subtle font-mono">
      <span>0% (Black)</span>
      <span>100% (White)</span>
    </div>

    <!-- The Track Container -->
    <div class="spectrum-track">
      <!-- Gradient Background (The Equator) -->
      <div class="gradient-bg"></div>

      <!-- Light Mode Zone (Above) -->
      <div class="slider-layer light-layer">
        <div class="zone-label">Light Mode</div>
        <RangeSlider
          start={lightInk}
          end={lightSurface}
          label="Light Mode"
          fillClass={getFillClass(lightContrast)}
          handleClass="surface-action hue-info"
          startHandleShape="circle"
          endHandleShape="square"
          startHandleLabel="T"
          endHandleLabel="Bg"
          onChange={handleLightChange}
        />
        <!-- Contrast Badge (Pill on Bridge) -->
        <div
          class="contrast-badge light font-mono"
          style="left: {((lightInk + lightSurface) / 2) * 100}%"
        >
          <span class={getContrastColorClass(lightContrast)}
            >{lightContrast.toFixed(1)}:1</span
          >
        </div>
      </div>

      <!-- Dark Mode Zone (Below) -->
      <div class="slider-layer dark-layer">
        <RangeSlider
          start={darkSurface}
          end={darkInk}
          label="Dark Mode"
          fillClass={getFillClass(darkContrast)}
          handleClass="surface-action hue-brand"
          startHandleShape="square"
          endHandleShape="circle"
          startHandleLabel="Bg"
          endHandleLabel="T"
          onChange={handleDarkChange}
        />
        <!-- Contrast Badge (Pill on Bridge) -->
        <div
          class="contrast-badge dark font-mono"
          style="left: {((darkSurface + darkInk) / 2) * 100}%"
        >
          <span class={getContrastColorClass(darkContrast)}
            >{darkContrast.toFixed(1)}:1</span
          >
        </div>
        <div class="zone-label bottom">Dark Mode</div>
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
    height: 160px; /* Increased height for breathing room */
    background: var(--surface-2);
    border-radius: 6px;
  }

  .gradient-bg {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 4px;
    transform: translateY(-50%);
    background: linear-gradient(to right, black, white);
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    z-index: 0;
  }

  .slider-layer {
    position: absolute;
    left: 0;
    width: 100%;
    height: 50%; /* Each zone takes half height */
    pointer-events: none;
  }

  .light-layer {
    top: 0;
    z-index: 2;
  }

  .dark-layer {
    top: 50%;
    z-index: 1;
  }

  .zone-label {
    position: absolute;
    left: 1rem;
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .light-layer .zone-label {
    top: 0.5rem;
  }

  .dark-layer .zone-label.bottom {
    bottom: 0.5rem;
  }

  /* Make RangeSlider children interactive */
  .slider-layer :global(.range-slider) {
    pointer-events: none;
  }
  .slider-layer :global(.range-fill),
  .slider-layer :global(.handle) {
    pointer-events: auto;
  }

  /* Position Handles and Tethers */
  /* Light Mode: Handles closer to bottom of its zone (near equator) */
  .light-layer :global(.range-fill),
  .light-layer :global(.handle) {
    top: 70% !important; /* Just above the equator */
  }

  /* Dark Mode: Handles closer to top of its zone (near equator) */
  .dark-layer :global(.range-fill),
  .dark-layer :global(.handle) {
    top: 30% !important; /* Just below the equator */
  }

  /* Bridge Styling (Thicker tether) */
  .slider-layer :global(.range-fill) {
    height: 4px !important;
    border-radius: 2px;
  }

  .contrast-badge {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.7rem;
    background: var(--surface-1);
    padding: 2px 8px;
    border-radius: 12px; /* Pill shape */
    border: 1px solid var(--border-subtle);
    white-space: nowrap;
    pointer-events: none;
    z-index: 10;
    box-shadow: var(--shadow-sm);
  }

  .contrast-badge.light {
    top: 45%; /* Positioned on the bridge */
  }

  .contrast-badge.dark {
    top: 5%; /* Positioned on the bridge */
  }

  /* Text colors for badges */
  .text-success {
    color: var(--color-success, #10b981);
    font-weight: bold;
  }
  .text-warning {
    color: var(--color-warning, #f59e0b);
    font-weight: bold;
  }
  .text-error {
    color: var(--color-error, #ef4444);
    font-weight: bold;
  }
</style>
