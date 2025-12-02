<script lang="ts">
  import { getContext } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import ContextTreePanel from "./ContextTreePanel.svelte";
  import InspectorPanel from "./InspectorPanel.svelte";
  import StagePanel from "./StagePanel.svelte";

  const builder = getContext<BuilderState>("builder");

  // Respect prefers-reduced-motion
  const duration =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 200;
</script>

<div class="studio-layout surface-page">
  {#if builder.isSidebarOpen}
    <aside
      class="sidebar"
      style="width: {builder.sidebarWidth}px"
      transition:slide={{ axis: "x", duration, easing: cubicOut }}
    >
      <div class="panel-content">
        <ContextTreePanel />
      </div>
    </aside>
  {/if}

  <main class="stage">
    <StagePanel />
  </main>

  {#if builder.isInspectorOpen}
    <aside
      class="inspector"
      style="width: {builder.inspectorWidth}px"
      transition:slide={{ axis: "x", duration, easing: cubicOut }}
    >
      <div class="panel-content">
        <InspectorPanel />
      </div>
    </aside>
  {/if}
</div>

<style>
  .studio-layout {
    display: flex;
    /* Respect Starlight's navbar height */
    height: calc(100vh - 3.5rem);
    width: 100vw;
    overflow: hidden;
    position: fixed;
    top: 3.5rem;
    left: 0;
    z-index: 10; /* Lower than Starlight nav (usually 1000) but high enough for content */
  }

  .sidebar {
    flex-shrink: 0;
    border-right: 1px solid var(--border-dec-token);
    overflow: hidden; /* Required for slide transition */
  }

  .inspector {
    flex-shrink: 0;
    border-left: 1px solid var(--border-dec-token);
    overflow: hidden; /* Required for slide transition */
  }

  /* Ensure content doesn't squash during transition */
  .panel-content {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .stage {
    flex: 1;
    min-width: 0; /* Prevent flex item from overflowing */
  }

  /* Responsive: Auto-hide panels on small screens (handled via JS state ideally, but CSS fallback here) */
  @media (max-width: 1024px) {
    /* We'll rely on the user/JS to toggle, but we could force hide here if we wanted. 
       For now, let's just ensure the layout doesn't break by allowing scrolling if needed? 
       No, scrolling the whole layout is bad. 
       Let's just trust the user to close panels or implement auto-close in onMount later.
    */
  }
</style>
