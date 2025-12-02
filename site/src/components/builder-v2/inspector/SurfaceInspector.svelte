<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../../lib/state/BuilderState.svelte";
  import { configState } from "../../../lib/state/ConfigState.svelte";

  const builder = getContext<BuilderState>("builder");
  let surfaceId = $derived(builder.selectedSurfaceId);

  let surfaceConfig = $derived(
    configState.config.groups
      .flatMap((g) => g.surfaces)
      .find((s) => s.slug === surfaceId),
  );

  let solvedBackground = $derived(
    surfaceId ? configState.solved?.backgrounds.get(surfaceId) : undefined,
  );
</script>

<div class="inspector-section">
  <div class="header">
    <h3>Surface: {surfaceId}</h3>
    <button
      class="close-btn"
      onclick={() => {
        builder.selectSurface(null);
      }}
    >
      ✕
    </button>
  </div>

  {#if solvedBackground}
    <div class="context-trace">
      <h4>Solved Values</h4>
      <div class="trace-step">
        <span class="step-label">Light Mode</span>
        <span class="step-value">L* {solvedBackground.light.l.toFixed(1)}</span>
      </div>
      <div class="trace-step">
        <span class="step-label">Dark Mode</span>
        <span class="step-value">L* {solvedBackground.dark.l.toFixed(1)}</span>
      </div>
    </div>
  {/if}
</div>

{#if surfaceConfig}
  <div class="inspector-section">
    <h3>Overrides</h3>
    <div class="control-group">
      <label>
        <div class="label-row">
          <span>Contrast Offset (Light)</span>
          <span class="value">{surfaceConfig.contrastOffset?.light ?? 0}</span>
        </div>
        <input
          type="range"
          min="-20"
          max="20"
          value={surfaceConfig.contrastOffset?.light ?? 0}
          oninput={(e) => {
            if (surfaceId) {
              configState.updateSurfaceContrastOffset(
                surfaceId,
                "light",
                e.currentTarget.valueAsNumber,
              );
            }
          }}
        />
      </label>
      <label>
        <div class="label-row">
          <span>Contrast Offset (Dark)</span>
          <span class="value">{surfaceConfig.contrastOffset?.dark ?? 0}</span>
        </div>
        <input
          type="range"
          min="-20"
          max="20"
          value={surfaceConfig.contrastOffset?.dark ?? 0}
          oninput={(e) => {
            if (surfaceId) {
              configState.updateSurfaceContrastOffset(
                surfaceId,
                "dark",
                e.currentTarget.valueAsNumber,
              );
            }
          }}
        />
      </label>
    </div>
  </div>
{/if}

<div class="inspector-section">
  <h3>Contrast</h3>
  <div class="contrast-badge surface-action hue-success">
    <span class="score">APCA 75</span>
    <span class="status">Lc (Pass)</span>
  </div>
</div>

<style>
  .inspector-section {
    padding: 1rem;
    border-bottom: 1px solid var(--border-dec-token);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-high-token);
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-subtle-token);
  }

  .context-trace {
    border: 1px solid var(--border-dec-token);
    padding: 0.75rem;
    border-radius: 4px;
  }

  .trace-step {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    padding: 0.25rem 0;
  }

  .trace-step.active {
    font-weight: bold;
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

  .contrast-badge {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .score {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .status {
    font-size: 0.7rem;
    text-transform: uppercase;
  }
</style>
