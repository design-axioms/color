<script lang="ts">
  import { formatHex } from "culori";
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import LuminanceSpectrum from "../../builder/LuminanceSpectrum.svelte";
  import VibeControls from "./VibeControls.svelte";

  // Global Inspector: Controls for system-wide parameters (Anchors, Key Colors).

  function safeFormatHex(val: string | undefined): string {
    if (!val) return "#000000";
    // Truncate long decimals in oklch strings to avoid parsing errors
    // e.g. oklch(0.6027... 0.302... 298...) -> oklch(0.603 0.302 298)
    const cleaned = val.replace(/(\d+\.\d{4,})/g, (match) =>
      parseFloat(match).toFixed(3),
    );
    const hex = formatHex(cleaned);
    return hex ?? "#000000";
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
          type="color"
          value={safeFormatHex(value)}
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
    padding: 1rem;
    border-bottom: 1px solid var(--computed-border-dec-color);
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
