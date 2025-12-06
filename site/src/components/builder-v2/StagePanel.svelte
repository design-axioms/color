<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import ComponentView from "./stage/ComponentView.svelte";
  import ContextTrace from "./stage/ContextTrace.svelte";
  import ExportView from "./stage/ExportView.svelte";

  const builder = getContext<BuilderState>("builder");
</script>

<div class="panel">
  <div class="toolbar">
    <div class="group left">
      <button
        class:active={builder.isSidebarOpen}
        onclick={() => {
          builder.toggleSidebar();
        }}
        aria-label={builder.isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        title={builder.isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="9" x2="9" y1="3" y2="21" />
          {#if builder.isSidebarOpen}
            <path
              d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4V3z"
              fill="currentColor"
              fill-opacity="0.2"
              stroke="none"
            />
          {/if}
        </svg>
      </button>
    </div>

    <div class="group center">
      <div class="view-toggle">
        <button
          class:active={builder.viewMode === "component"}
          onclick={() => {
            builder.setViewMode("component");
          }}
        >
          Preview
        </button>
        <button
          class:active={builder.viewMode === "export"}
          onclick={() => {
            builder.setViewMode("export");
          }}
        >
          Export
        </button>
      </div>
    </div>

    <div class="group right">
      <button
        class:active={builder.isInspectorOpen}
        onclick={() => {
          builder.toggleInspector();
        }}
        aria-label={builder.isInspectorOpen
          ? "Close Inspector"
          : "Open Inspector"}
        title={builder.isInspectorOpen ? "Close Inspector" : "Open Inspector"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="15" x2="15" y1="3" y2="21" />
          {#if builder.isInspectorOpen}
            <path
              d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4V3z"
              fill="currentColor"
              fill-opacity="0.2"
              stroke="none"
            />
          {/if}
        </svg>
      </button>
    </div>
  </div>

  <div class="canvas">
    {#if builder.viewMode === "component"}
      <ComponentView />
      <ContextTrace />
    {:else if builder.viewMode === "export"}
      <ExportView />
    {/if}
  </div>
</div>

{#if builder.selectedSurfaceId}
  <style>
    :global(.surface-{builder.selectedSurfaceId}) {
      outline: 2px solid var(--highlight-ring-color, #d946ef) !important;
      outline-offset: 2px;
      position: relative;
      z-index: 5;
    }
  </style>
{/if}

<style>
  .panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--surface-page);
  }

  .toolbar {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--computed-border-dec-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .group {
    display: flex;
    gap: 0.25rem;
  }

  .view-toggle {
    display: flex;
    background: var(--surface-card);
    padding: 2px;
    border-radius: 6px;
    border: 1px solid var(--computed-border-dec-color);
  }

  .view-toggle button {
    padding: 0.25rem 0.75rem;
    height: 28px;
    min-width: auto;
    border: none;
    border-radius: 4px;
    background: transparent;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--computed-fg-subtle);
  }

  .view-toggle button:hover {
    color: var(--computed-fg-color);
    background: transparent;
  }

  .view-toggle button.active {
    background: var(--surface-action);
    color: var(--computed-fg-color);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  button {
    padding: 0.25rem 0.5rem;
    height: 32px;
    min-width: 32px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    transition: all 0.2s ease;
  }

  button:hover {
    background: var(--surface-card);
    color: var(--computed-fg-color);
  }

  button.active {
    background: var(--surface-action);
    border-color: var(--computed-border-int-color);
    color: var(--computed-fg-color);
  }

  .canvas {
    flex: 1;
    overflow: auto;
    position: relative;
  }
</style>
