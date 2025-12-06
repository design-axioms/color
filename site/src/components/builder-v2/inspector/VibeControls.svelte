<script lang="ts">
  import { converter } from "culori";
  import { setContrast, setVibrancy } from "../../../lib/engine/VibeEngine";
  import { configState } from "../../../lib/state/ConfigState.svelte";

  const toOklch = converter("oklch");

  let contrast = $state(50);
  let vibrancy = $state(50);

  function updateContrast(): void {
    setContrast(configState.config, contrast);
  }

  function updateVibrancy(): void {
    setVibrancy(configState.config, vibrancy);
  }

  let hue = $derived.by(() => {
    const keys = Object.keys(configState.config.anchors.keyColors);
    if (keys.length > 0) {
      const color = configState.config.anchors.keyColors[keys[0]];
      const oklch = toOklch(color);
      return oklch?.h ?? 0;
    }
    return 0;
  });

  let vibrancyGradient = $derived(
    `linear-gradient(to right, oklch(0.6 0 ${hue}), oklch(0.6 0.3 ${hue}))`,
  );

  // Contrast: Visualized as a gradient from low contrast (grayish) to high contrast (black/white)
  let contrastGradient =
    "linear-gradient(to right, oklch(0.6 0 0), oklch(0 0 0))";
</script>

<div class="vibe-controls bg-surface">
  <div class="control">
    <label>
      <span class="label-text text-subtle">Contrast</span>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={contrast}
        oninput={updateContrast}
        style="background: {contrastGradient}"
      />
    </label>
  </div>
  <div class="control">
    <label>
      <span class="label-text text-subtle">Vibrancy</span>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={vibrancy}
        oninput={updateVibrancy}
        style="background: {vibrancyGradient}"
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
  }

  input[type="range"] {
    width: 100%;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    outline: none;
    margin-top: 0.25rem;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--computed-surface);
    border: 1px solid var(--computed-border-dec-color);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--computed-surface);
    border: 1px solid var(--computed-border-dec-color);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
  }
</style>
