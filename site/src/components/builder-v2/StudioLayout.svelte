<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import ContextTreePanel from "./ContextTreePanel.svelte";
  import InspectorPanel from "./InspectorPanel.svelte";
  import StagePanel from "./StagePanel.svelte";

  const builder = getContext<BuilderState>("builder");
</script>

<div class="studio-layout surface-page">
  <aside class="sidebar" style="width: {builder.sidebarWidth}px">
    <ContextTreePanel />
  </aside>

  <main class="stage">
    <StagePanel />
  </main>

  <aside class="inspector" style="width: {builder.inspectorWidth}px">
    <InspectorPanel />
  </aside>
</div>

<style>
  .studio-layout {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000; /* Overlay Starlight UI */
  }

  .sidebar {
    flex-shrink: 0;
  }

  .stage {
    flex: 1;
    min-width: 0; /* Prevent flex item from overflowing */
  }

  .inspector {
    flex-shrink: 0;
  }
</style>
