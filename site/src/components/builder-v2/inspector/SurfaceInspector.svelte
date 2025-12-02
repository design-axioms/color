<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../../lib/state/BuilderState.svelte";
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../../lib/state/ThemeState.svelte";
  import ContrastBadge from "../../builder/ContrastBadge.svelte";

  const builder = getContext<BuilderState>("builder");
  const themeState = getContext<ThemeState>("theme");

  let surfaceId = $derived(builder.selectedSurfaceId);
  let mode = $derived(themeState.mode);
  let solved = $derived(configState.solved);

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
    <h3 class="text-strong">Surface: {surfaceId}</h3>
    <button
      class="close-btn text-subtle"
      onclick={() => {
        builder.selectSurface(null);
      }}
    >
      ✕
    </button>
  </div>

  {#if solvedBackground}
    <div class="context-trace bordered">
      <h4 class="text-strong">Solved Values</h4>
      <div class="trace-step">
        <span class="step-label">Light Mode</span>
        <span class="step-value text-subtle"
          >L* {solvedBackground.light.l.toFixed(1)}</span
        >
      </div>
      <div class="trace-step">
        <span class="step-label">Dark Mode</span>
        <span class="step-value text-subtle"
          >L* {solvedBackground.dark.l.toFixed(1)}</span
        >
      </div>
    </div>
  {/if}
</div>

{#if surfaceConfig}
  <div class="inspector-section">
    <h3 class="text-strong">Overrides</h3>
    <div class="control-group">
      <label>
        <div class="label-row">
          <span>Contrast Offset (Light)</span>
          <span class="value text-subtle"
            >{surfaceConfig.contrastOffset?.light ?? 0}</span
          >
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
          <span class="value text-subtle"
            >{surfaceConfig.contrastOffset?.dark ?? 0}</span
          >
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
  <h3 class="text-strong">Contrast</h3>
  {#if surfaceId}
    <div class="contrast-wrapper">
      <ContrastBadge slug={surfaceId} {mode} {solved} showStatus={true} />
    </div>
  {:else}
    <div class="contrast-badge surface-workspace bordered">
      <span class="score">--</span>
      <span class="status">N/A</span>
    </div>
  {/if}
</div>

<style>
  .inspector-section {
    padding: 1rem;
    border-bottom: 1px solid var(--computed-border-dec-color);
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
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
  }

  .context-trace {
    border: 1px solid var(--computed-border-dec-color);
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
    color: var(--computed-fg-color);
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
    color: var(--computed-text-subtle);
    font-variant-numeric: tabular-nums;
  }

  .contrast-wrapper {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
  }

  .contrast-badge.surface-workspace {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--computed-border-dec-color);
    background: var(--surface-workspace);
  }

  .score {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .status {
    font-size: 0.7rem;
    text-transform: uppercase;
  }

  input[type="range"] {
    width: 100%;
    box-sizing: border-box;
  }
</style>
