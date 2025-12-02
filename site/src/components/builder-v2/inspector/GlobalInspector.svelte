<script lang="ts">
  import { configState } from "../../../lib/state/ConfigState.svelte";

  // Global Inspector: Controls for system-wide parameters (Anchors, Key Colors).

  function toPercent(val: number): number {
    return Math.round(val * 100);
  }
  function fromPercent(val: number): number {
    return val / 100;
  }
</script>

<div class="inspector-section">
  <h3>Page Anchors</h3>
  <div class="control-group">
    <label>
      <div class="label-row">
        <span>Light Start (L*)</span>
        <span class="value"
          >{toPercent(
            configState.config.anchors.page.light.start.background,
          )}%</span
        >
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={toPercent(
          configState.config.anchors.page.light.start.background,
        )}
        oninput={(e) => {
          configState.updateAnchor(
            "page",
            "light",
            "start",
            fromPercent(e.currentTarget.valueAsNumber),
          );
        }}
      />
    </label>
    <label>
      <div class="label-row">
        <span>Light End (L*)</span>
        <span class="value"
          >{toPercent(
            configState.config.anchors.page.light.end.background,
          )}%</span
        >
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={toPercent(configState.config.anchors.page.light.end.background)}
        oninput={(e) => {
          configState.updateAnchor(
            "page",
            "light",
            "end",
            fromPercent(e.currentTarget.valueAsNumber),
          );
        }}
      />
    </label>
    <label>
      <div class="label-row">
        <span>Dark Start (L*)</span>
        <span class="value"
          >{toPercent(
            configState.config.anchors.page.dark.start.background,
          )}%</span
        >
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={toPercent(configState.config.anchors.page.dark.start.background)}
        oninput={(e) => {
          configState.updateAnchor(
            "page",
            "dark",
            "start",
            fromPercent(e.currentTarget.valueAsNumber),
          );
        }}
      />
    </label>
    <label>
      <div class="label-row">
        <span>Dark End (L*)</span>
        <span class="value"
          >{toPercent(
            configState.config.anchors.page.dark.end.background,
          )}%</span
        >
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={toPercent(configState.config.anchors.page.dark.end.background)}
        oninput={(e) => {
          configState.updateAnchor(
            "page",
            "dark",
            "end",
            fromPercent(e.currentTarget.valueAsNumber),
          );
        }}
      />
    </label>
  </div>
</div>

<div class="inspector-section">
  <h3>Key Colors</h3>
  <div class="control-group">
    {#each Object.entries(configState.config.anchors.keyColors) as [key, value] (key)}
      <label>
        <span>{key}</span>
        <input
          type="color"
          {value}
          oninput={(e) => {
            configState.updateKeyColor(key, e.currentTarget.value);
          }}
        />
      </label>
    {/each}
  </div>
</div>

<div class="inspector-section">
  <h3>Hue Shift</h3>
  <p class="text-subtle">Curve controls coming soon.</p>
</div>

<style>
  .inspector-section {
    padding: 1rem;
    border-bottom: 1px solid var(--border-dec-token);
  }

  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text-high-token);
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
    color: var(--text-subtle-token);
    font-variant-numeric: tabular-nums;
  }

  input[type="range"] {
    width: 100%;
  }

  .text-subtle {
    font-size: 0.8rem;
    color: var(--text-subtle-token);
  }
</style>
