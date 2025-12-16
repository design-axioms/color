<script lang="ts">
  import { APCAcontrast, sRGBtoY } from "apca-w3";
  import { converter } from "culori";
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import RangeSlider from "./RangeSlider.svelte";

  const configState = getContext<ConfigState>("config");

  // Dark Mode: Page (Start) -> Limit (End)
  const darkPage = $derived(
    configState.config.anchors.page.dark.start.background,
  );
  const darkLimit = $derived(
    configState.config.anchors.page.dark.end.background,
  );

  // Light Mode: Limit (End) -> Page (Start)
  const lightLimit = $derived(
    configState.config.anchors.page.light.end.background,
  );
  const lightPage = $derived(
    configState.config.anchors.page.light.start.background,
  );

  // Count surfaces using 'page' polarity
  const pageSurfaceCount = $derived(
    configState.config.groups.reduce((count, group) => {
      return count + group.surfaces.filter((s) => s.polarity === "page").length;
    }, 0),
  );

  // APCA Contrast Calculation
  const toRgb = converter("rgb");

  function getAPCA(l1: number, l2: number): number {
    function getY(l: number): number {
      const rgb = toRgb({ mode: "oklch", l: l, c: 0, h: 0 });
      // Convert 0-1 RGB to 0-255 integer array for sRGBtoY
      const r = Math.round(Math.max(0, Math.min(1, rgb.r)) * 255);
      const g = Math.round(Math.max(0, Math.min(1, rgb.g)) * 255);
      const b = Math.round(Math.max(0, Math.min(1, rgb.b)) * 255);
      return sRGBtoY([r, g, b]);
    }

    const y1 = getY(l1);
    const y2 = getY(l2);
    const contrast = APCAcontrast(y1, y2);
    return Math.abs(typeof contrast === "number" ? contrast : 0);
  }

  const darkContrast = getAPCA(darkLimit, darkPage);
  const lightContrast = getAPCA(lightLimit, lightPage);

  function getHandleStyle(l: number): string {
    void l;
    // RFC010: avoid emitting color literals/functions in consumer code.
    // Handles already have token classes; keep this empty.
    return "";
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
    <div
      class="zone-label top-left surface-workspace preset-bordered text-strong"
    >
      Light Mode
    </div>

    <!-- The Track Container -->
    <div class="spectrum-track surface-workspace bordered">
      <!-- Gradient Background (The Ruler) -->
      <div class="gradient-bg"></div>

      <!-- Light Mode Zone (Above) -->
      <div class="slider-layer light-layer">
        <!-- Projection Lines -->
        <div class="projection-line" style="left: {lightLimit * 100}%"></div>
        <div class="projection-line" style="left: {lightPage * 100}%"></div>

        <RangeSlider
          start={lightLimit}
          end={lightPage}
          label="Light Mode"
          trackClass="invisible-track"
          fillClass="surface-action bridge"
          handleClass="surface-action text-inverse"
          startHandleShape="pill"
          endHandleShape="pill"
          startHandleLabel="Limit"
          endHandleLabel="Page"
          startHandleStyle={getHandleStyle(lightLimit)}
          endHandleStyle={getHandleStyle(lightPage)}
          minRange={0.05}
          onChange={handleLightChange}
        />
        <!-- Contrast Badge -->
        <div
          class="contrast-badge font-mono"
          style="left: {((lightLimit + lightPage) / 2) * 100}%"
        >
          <div class="badge-content surface-workspace preset-bordered">
            <span class="badge-text text-subtle"
              >Lc {Math.round(lightContrast)} spread over {pageSurfaceCount} surface{pageSurfaceCount !==
              1
                ? "s"
                : ""}</span
            >
          </div>
        </div>
      </div>

      <!-- Dark Mode Zone (Below) -->
      <div class="slider-layer dark-layer">
        <!-- Projection Lines -->
        <div class="projection-line" style="left: {darkPage * 100}%"></div>
        <div class="projection-line" style="left: {darkLimit * 100}%"></div>

        <RangeSlider
          start={darkPage}
          end={darkLimit}
          label="Dark Mode"
          trackClass="invisible-track"
          fillClass="surface-action bridge"
          handleClass="surface-action text-inverse"
          startHandleShape="pill"
          endHandleShape="pill"
          startHandleLabel="Page"
          endHandleLabel="Limit"
          startHandleStyle={getHandleStyle(darkPage)}
          endHandleStyle={getHandleStyle(darkLimit)}
          minRange={0.05}
          onChange={handleDarkChange}
        />
        <!-- Contrast Badge -->
        <div
          class="contrast-badge font-mono"
          style="left: {((darkPage + darkLimit) / 2) * 100}%"
        >
          <div class="badge-content surface-workspace preset-bordered">
            <span class="badge-text text-subtle"
              >Lc {Math.round(darkContrast)} spread over {pageSurfaceCount} surface{pageSurfaceCount !==
              1
                ? "s"
                : ""}</span
            >
          </div>
        </div>
      </div>
    </div>

    <div
      class="zone-label bottom-left surface-workspace preset-bordered text-strong"
    >
      Dark Mode
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
    padding: 0 1.5rem;
  }

  .axis-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
  }

  .spectrum-track {
    position: relative;
    height: 200px;
    border-radius: 6px;
  }

  .gradient-bg {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 20px;
    transform: translateY(-50%);
    background: linear-gradient(to right, CanvasText, Canvas);
    border-radius: 2px;
    z-index: 0;
  }

  /* Ticks on Ruler: 0, 50, 100 */
  .gradient-bg::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to right, currentColor 1px, transparent 1px);
    opacity: 0.2;
    background-size: 50% 100%;
    pointer-events: none;
  }
  .gradient-bg::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 1px;
    background: currentColor;
    opacity: 0.2;
    pointer-events: none;
  }

  .slider-layer {
    position: absolute;
    left: 0;
    width: 100%;
    height: 50%;
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
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 4px 8px;
    border-radius: 4px;
    align-self: flex-start;
  }

  .zone-label.top-left {
    margin-bottom: 0.25rem;
  }

  .zone-label.bottom-left {
    margin-top: 0.5rem;
  }

  /* Projection Lines - More visible */
  .projection-line {
    position: absolute;
    width: 1px;
    background-color: transparent;
    border-left: 1px dashed currentColor;
    opacity: 0.25;
    z-index: 0;
  }

  .light-layer .projection-line {
    top: 50%;
    bottom: 0;
  }

  .dark-layer .projection-line {
    top: 0;
    bottom: 50%;
  }

  /* Make RangeSlider children interactive */
  .slider-layer :global(.range-slider) {
    pointer-events: auto;
  }
  .slider-layer :global(.range-fill),
  .slider-layer :global(.handle) {
    pointer-events: auto;
  }

  /* Hide the default track of the RangeSlider */
  .slider-layer :global(.invisible-track) {
    background-color: transparent !important;
  }

  /* Position Handles and Tethers */
  .light-layer :global(.range-fill),
  .light-layer :global(.handle) {
    top: 50% !important;
  }

  .dark-layer :global(.range-fill),
  .dark-layer :global(.handle) {
    top: 50% !important;
  }

  /* General Handle Styling */
  .contrast-badge {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.8rem;
    pointer-events: none;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap; /* Prevent wrapping */
  }

  /* Stem for the badge */
  .contrast-badge::before {
    content: "";
    position: absolute;
    left: 50%;
    width: 1px;
    background: currentColor;
    opacity: 0.25;
    z-index: -1;
  }

  .contrast-badge.light,
  .light-layer .contrast-badge {
    top: auto;
    bottom: 50%;
    margin-bottom: 32px; /* Lift well above handles */
    margin-top: 0;
  }

  .light-layer .contrast-badge::before {
    top: 100%;
    height: 32px;
  }

  .contrast-badge.dark,
  .dark-layer .contrast-badge {
    top: 50%;
    bottom: auto;
    margin-top: 32px; /* Push well below handles */
    margin-bottom: 0;
  }

  .dark-layer .contrast-badge::before {
    bottom: 100%;
    height: 32px;
  }

  .badge-content {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .badge-text {
    font-weight: 600;
    font-size: 0.75rem;
  }
</style>
