<script lang="ts">
  import { getContext } from 'svelte';
  import type { ConfigState } from '../../lib/state/ConfigState.svelte';

  const configState = getContext<ConfigState>('config');
  let config = $derived(configState.config);
</script>

{#if config.hueShift}
  <div>
    <h3 class="text-strong" style="margin-bottom: 1rem;">Hue Shift</h3>
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <label
        class="text-subtle"
        style="display: flex; flex-direction: column; gap: 0.5rem;"
      >
        <div style="display: flex; justify-content: space-between;">
          <span>Max Rotation</span>
          <span>{config.hueShift.maxRotation}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="180"
          step="1"
          value={config.hueShift.maxRotation}
          oninput={(e) =>
            configState.updateHueShiftRotation(parseFloat(e.currentTarget.value))
          }
        />
      </label>
      <p class="text-subtlest" style="font-size: 0.85rem;">
        Controls how much the hue rotates as lightness changes.
      </p>
    </div>
  </div>
{/if}
