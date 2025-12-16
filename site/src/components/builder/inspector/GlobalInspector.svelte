<script lang="ts">
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import LuminanceSpectrum from "../LuminanceSpectrum.svelte";
  import VibeControls from "./VibeControls.svelte";

  // Global Inspector: Controls for system-wide parameters (Anchors, Key Colors).

  function normalizeColorString(val: string | undefined): string {
    if (!val) return "";
    // Truncate long decimals in color strings to reduce noise.
    return val.replace(/(\d+\.\d{4,})/g, (match) =>
      parseFloat(match).toFixed(3),
    );
  }
</script>

<div class="inspector-section">
  <h3 class="text-strong">Vibe</h3>
  <VibeControls />
</div>

<div class="inspector-section">
  <LuminanceSpectrum />
</div>

<div class="inspector-section">
  <h3 class="text-strong">Key Colors</h3>
  <div class="control-group">
    {#each Object.entries(configState.config.anchors.keyColors) as [key, value] (key)}
      <label>
        <span>{key}</span>
        <input
          type="text"
          value={normalizeColorString(value)}
          oninput={(e) => {
            configState.updateKeyColor(key, e.currentTarget.value);
          }}
        />
      </label>
    {/each}
  </div>
</div>

<div class="inspector-section">
  <h3 class="text-strong">Hue Shift</h3>
  <p class="text-subtle">Curve controls coming soon.</p>
</div>

<style>
  .inspector-section {
    position: relative;
    padding: 1rem;
  }

  .inspector-section::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: currentColor;
    opacity: 0.12;
  }

  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
  }

  .value {
    font-variant-numeric: tabular-nums;
  }

  input[type="range"] {
    width: 100%;
  }

  .text-subtle {
    font-size: 0.8rem;
  }
</style>
