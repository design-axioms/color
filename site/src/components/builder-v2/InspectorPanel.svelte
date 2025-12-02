<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import GlobalInspector from "./inspector/GlobalInspector.svelte";
  import SurfaceInspector from "./inspector/SurfaceInspector.svelte";

  const builder = getContext<BuilderState>("builder");
</script>

<div class="panel">
  {#if builder.inspectorMode === "surface" && builder.selectedSurfaceId}
    <SurfaceInspector />
  {:else}
    <GlobalInspector />
  {/if}
</div>

<style>
  .panel {
    height: 100%;
    border-left: 1px solid var(--sl-color-gray-5);
    background: var(--sl-color-gray-1);
    overflow-y: auto;
  }
</style>
