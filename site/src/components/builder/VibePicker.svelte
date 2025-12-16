<script lang="ts">
  import { VIBES } from "@axiomatic-design/color";
  import { configState } from "../../lib/state/ConfigState.svelte";

  const vibeEntries = Object.entries(VIBES);
</script>

<div class="vibe-picker">
  <label class="text-strong" for="vibe-select">Vibe</label>
  <select
    id="vibe-select"
    class="surface-input preset-bordered text-content"
    value={configState.vibeId}
    onchange={(e) => {
      configState.loadVibe(e.currentTarget.value);
    }}
  >
    <option value="">Custom</option>
    {#each vibeEntries as [key, vibe] (key)}
      <option value={key}>{vibe.name}</option>
    {/each}
  </select>
  {#if configState.vibeId && VIBES[configState.vibeId]}
    <p class="description text-subtle">
      {VIBES[configState.vibeId].description}
    </p>
  {/if}
</div>

<style>
  .vibe-picker {
    position: relative;
    padding: 1rem;
  }

  .vibe-picker::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: currentColor;
    opacity: 0.15;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .description {
    margin-top: 0.5rem;
    font-size: 0.75rem;
  }
</style>
