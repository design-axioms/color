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

  // --- Resizing Logic ---
  let isResizingSidebar = $state(false);
  let isResizingInspector = $state(false);

  function startSidebarResize(e: MouseEvent): void {
    e.preventDefault();
    isResizingSidebar = true;
    window.addEventListener("mousemove", handleSidebarResize);
    window.addEventListener("mouseup", stopResize);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function startInspectorResize(e: MouseEvent): void {
    e.preventDefault();
    isResizingInspector = true;
    window.addEventListener("mousemove", handleInspectorResize);
    window.addEventListener("mouseup", stopResize);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function handleSidebarResize(e: MouseEvent): void {
    if (!isResizingSidebar) return;
    // Min width 200, Max width 600 (or 50% of screen)
    const newWidth = Math.max(200, Math.min(e.clientX, 600));
    builder.sidebarWidth = newWidth;
  }

  function handleInspectorResize(e: MouseEvent): void {
    if (!isResizingInspector) return;
    // Calculate width from right edge
    const newWidth = Math.max(
      250,
      Math.min(window.innerWidth - e.clientX, 600),
    );
    builder.inspectorWidth = newWidth;
  }

  function stopResize(): void {
    isResizingSidebar = false;
    isResizingInspector = false;
    window.removeEventListener("mousemove", handleSidebarResize);
    window.removeEventListener("mousemove", handleInspectorResize);
    window.removeEventListener("mouseup", stopResize);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }
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
      <!-- Resize Handle -->
      <div
        class="resize-handle sidebar-handle"
        onmousedown={startSidebarResize}
        aria-hidden="true"
      ></div>
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
      <!-- Resize Handle (Left side of inspector) -->
      <div
        class="resize-handle inspector-handle"
        onmousedown={startInspectorResize}
        aria-hidden="true"
      ></div>
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
    /* Use left/right 0 instead of width: 100vw to avoid scrollbar issues */
    right: 0;
    width: auto;
    overflow: hidden;
    position: fixed;
    top: 3.5rem;
    left: 0;
    z-index: 10; /* Lower than Starlight nav (usually 1000) but high enough for content */
  }

  .sidebar {
    flex-shrink: 0;
    border-right: 1px solid var(--computed-border-dec-color);
    display: flex;
    flex-direction: row;
    position: relative; /* For absolute handle */
  }

  .inspector {
    flex-shrink: 0;
    border-left: 1px solid var(--computed-border-dec-color);
    display: flex;
    flex-direction: row;
    position: relative; /* For absolute handle */
  }

  /* Ensure content doesn't squash during transition */
  .panel-content {
    flex: 1;
    height: 100%;
    overflow: auto;
    min-width: 0; /* Allow shrinking */
  }

  .resize-handle {
    width: 6px;
    cursor: col-resize;
    z-index: 100;
    transition: background-color 0.2s;
    position: absolute;
    top: 0;
    bottom: 0;
  }

  .resize-handle:hover,
  .resize-handle:active {
    background-color: var(--highlight-ring-color, #d946ef);
    opacity: 0.5;
  }

  .sidebar-handle {
    right: -3px;
  }

  .inspector-handle {
    left: -3px;
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
