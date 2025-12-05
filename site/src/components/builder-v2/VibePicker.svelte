<script lang="ts">
  import { VIBES } from "@axiomatic-design/color";
  import { configState } from "../../lib/state/ConfigState.svelte";

  const vibeEntries = Object.entries(VIBES);
</script>

<div class="vibe-picker">
  <label for="vibe-select">Vibe</label>
  <select
    id="vibe-select"
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
    <p class="description">{VIBES[configState.vibeId].description}</p>
  {/if}
</div>

<style>
  .vibe-picker {
    padding: 1rem;
    border-bottom: 1px solid var(--computed-border-dec-color);
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--computed-fg-strong-color);
  }

  select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid var(--computed-border-dec-color);
    background-color: var(--computed-bg-color);
    color: var(--computed-fg-baseline-color);
    font-size: 0.875rem;
  }

  .description {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--computed-fg-subtle-color);
  }
</style>
