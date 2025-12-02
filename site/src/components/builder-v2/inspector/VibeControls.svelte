<script lang="ts">
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import { setContrast, setVibrancy } from "../../../lib/engine/VibeEngine";

  let contrast = $state(50);
  let vibrancy = $state(50);

  function updateContrast(): void {
    setContrast(configState.config, contrast);
  }

  function updateVibrancy(): void {
    setVibrancy(configState.config, vibrancy);
  }
</script>

<div class="vibe-controls">
  <div class="control">
    <label>
      <span class="label-text">Contrast</span>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={contrast}
        oninput={updateContrast}
      />
    </label>
  </div>
  <div class="control">
    <label>
      <span class="label-text">Vibrancy</span>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={vibrancy}
        oninput={updateVibrancy}
      />
    </label>
  </div>
</div>

<style>
  .vibe-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface-sunken);
    border-radius: 4px;
  }

  .control label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .label-text {
    font-weight: 500;
    color: var(--text-subtle-token);
  }

  input[type="range"] {
    width: 100%;
  }
</style>
