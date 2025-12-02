<script lang="ts">
  import { getContext } from "svelte";
  import { builderState } from "../../lib/state/BuilderState.svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";
  import GamutSlice from "./GamutSlice.svelte";
  import VisualizerGraph from "./VisualizerGraph.svelte";

  const configState = getContext<ConfigState>("config");
  const themeState = getContext<ThemeState>("theme");

  let solved = $derived(configState.solved);
  let resolvedTheme = $derived(themeState.mode);
  let selectedSurfaceId = $derived(builderState.selectedSurfaceId);

  let hue = $state(0);

  $effect(() => {
    if (selectedSurfaceId && solved) {
      const color = solved.backgrounds.get(selectedSurfaceId)?.[resolvedTheme];
      if (color) {
        hue = color.h;
      }
    }
  });
</script>

<div class="analysis-view">
  <div class="section">
    <VisualizerGraph />
  </div>

  <div class="section">
    <div class="header">
      <h3 class="text-strong">Gamut Slice</h3>
      <p class="text-subtle">
        Visualizing available chroma at Hue {hue.toFixed(1)}°.
      </p>
    </div>

    <div class="controls">
      <label class="text-subtle">
        <span>Hue</span>
        <input type="range" min="0" max="360" bind:value={hue} />
        <input
          type="number"
          min="0"
          max="360"
          bind:value={hue}
          class="hue-input bordered surface-card text-strong"
        />
      </label>
    </div>

    <GamutSlice {hue} highlightSlug={selectedSurfaceId} />
  </div>
</div>

<style>
  .analysis-view {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    height: 100%;
    overflow-y: auto;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .hue-input {
    width: 60px;
    padding: 0.25rem;
    border-radius: 4px;
  }
</style>
