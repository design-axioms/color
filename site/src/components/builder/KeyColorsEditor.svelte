<script lang="ts">
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";

  const configState = getContext<ConfigState>("config");
  let config = $derived(configState.config);
</script>

<div>
  <h3 class="text-strong" style="margin-bottom: 1rem;">Key Colors</h3>
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    {#each Object.entries(config.anchors.keyColors) as [key, value] (key)}
      <label
        class="text-subtle"
        style="display: flex; flex-direction: column; gap: 0.5rem;"
      >
        <span style="text-transform: capitalize;">{key}</span>
        <div style="display: flex; gap: 0.5rem;">
          <input
            type="color"
            {value}
            oninput={(e) => {
              configState.updateKeyColor(key, e.currentTarget.value);
            }}
            style="width: 40px; height: 40px; padding: 0; border: none; cursor: pointer;"
          />
          <input
            type="text"
            {value}
            oninput={(e) => {
              configState.updateKeyColor(key, e.currentTarget.value);
            }}
            style="flex: 1; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-subtle-token); background: transparent; color: var(--text-high-token);"
          />
        </div>
      </label>
    {/each}
  </div>
</div>
