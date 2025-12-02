<script lang="ts">
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import AnchorGraph from "./AnchorGraph.svelte";

  const configState = getContext<ConfigState>("config");
</script>

<div
  class="surface-workspace bordered"
  style="padding: 1.5rem; border-radius: 6px;"
>
  <div style="margin-bottom: 1.5rem;">
    <div
      style="display: flex; justify-content: space-between; align-items: flex-start;"
    >
      <div>
        <h3
          class="text-strong"
          style="margin: 0; font-size: 1rem; line-height: 1.2;"
        >
          Anchor Visualization
        </h3>
        <p class="text-subtle" style="margin: 0.25rem 0 0; font-size: 0.8rem;">
          Defines the lightness range for surfaces in this mode.
        </p>
      </div>
      <label
        style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; cursor: pointer; user-select: none;"
      >
        <input type="checkbox" bind:checked={configState.syncDark} />
        <span class="text-subtle">Sync Dark Mode</span>
      </label>
    </div>
  </div>

  <AnchorGraph />
</div>
