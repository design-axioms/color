<script lang="ts">
  import { converter, formatHex } from "culori";

  interface Props {
    value: string;
    onChange?: (value: string) => void;
  }

  let { value = $bindable(), onChange }: Props = $props();

  const toOklch = converter("oklch");

  let l = $state(0);
  let c = $state(0);
  let h = $state(0);

  // Sync internal state with external value
  $effect(() => {
    const color = toOklch(value);
    if (color) {
      l = color.l;
      c = color.c;
      h = color.h ?? 0;
    }
  });

  function update(): void {
    const color = { mode: "oklch" as const, l, c, h };
    const hex = formatHex(color);
    value = hex;
    onChange?.(hex);
  }

  function getGradient(channel: "l" | "c" | "h"): string {
    // Generate a CSS gradient for the slider track
    const steps = 10;
    const stops: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const color = {
        mode: "oklch" as const,
        l: channel === "l" ? t : l,
        c: channel === "c" ? t * 0.4 : c, // Max chroma 0.4
        h: channel === "h" ? t * 360 : h,
      };
      stops.push(formatHex(color));
    }
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }
</script>

<div class="color-picker-container surface-card bordered">
  <div class="preview-swatch bordered" style="background-color: {value};"></div>

  <div class="sliders">
    <div class="slider-row">
      <label class="text-subtle">
        L
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          bind:value={l}
          oninput={update}
          style="background: {getGradient('l')}"
        />
      </label>
      <span class="value text-subtle">{Math.round(l * 100)}%</span>
    </div>

    <div class="slider-row">
      <label class="text-subtle">
        C
        <input
          type="range"
          min="0"
          max="0.4"
          step="0.001"
          bind:value={c}
          oninput={update}
          style="background: {getGradient('c')}"
        />
      </label>
      <span class="value text-subtle">{c.toFixed(3)}</span>
    </div>

    <div class="slider-row">
      <label class="text-subtle">
        H
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          bind:value={h}
          oninput={update}
          style="background: {getGradient('h')}"
        />
      </label>
      <span class="value text-subtle">{Math.round(h)}°</span>
    </div>
  </div>
</div>

<style>
  .color-picker-container {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem;
    border-radius: 6px;
  }

  .preview-swatch {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .sliders {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .slider-row label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .slider-row input {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    appearance: none;
    cursor: pointer;
  }

  .slider-row input::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--computed-surface);
    border: 1px solid var(--computed-border-dec-color);
    box-shadow: var(--shadow-sm);
  }

  .value {
    width: 40px;
    font-size: 0.75rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
</style>
