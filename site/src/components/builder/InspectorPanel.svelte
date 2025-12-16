<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import GlobalInspector from "./inspector/GlobalInspector.svelte";
  import SurfaceInspector from "./inspector/SurfaceInspector.svelte";

  const builder = getContext<BuilderState>("builder");
</script>

<div class="panel surface-workspace">
  {#if builder.inspectorMode === "surface" && builder.selectedSurfaceId}
    <SurfaceInspector />
  {:else}
    <GlobalInspector />
  {/if}
</div>

<style>
  .panel {
    height: 100%;
    overflow-y: auto;
  }
</style>
