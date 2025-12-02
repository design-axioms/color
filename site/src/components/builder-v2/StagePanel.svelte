<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import AbstractView from "./stage/AbstractView.svelte";
  import AuditView from "./stage/AuditView.svelte";
  import ComponentView from "./stage/ComponentView.svelte";

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
      <button
        class:active={builder.viewMode === "component"}
        onclick={() => {
          builder.setViewMode("component");
        }}>Component</button
      >
      <button
        class:active={builder.viewMode === "abstract"}
        onclick={() => {
          builder.setViewMode("abstract");
        }}>Abstract</button
      >
      <button
        class:active={builder.viewMode === "audit"}
        onclick={() => {
          builder.setViewMode("audit");
        }}>Audit</button
      >
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
    {:else if builder.viewMode === "abstract"}
      <AbstractView />
    {:else if builder.viewMode === "audit"}
      <AuditView />
    {/if}
  </div>
</div>

<style>
  .panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--surface-page);
  }

  .toolbar {
    padding: 0.5rem;
    border-bottom: 1px solid var(--border-dec-token);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .group {
    display: flex;
    gap: 0.25rem;
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
    color: var(--text-base-token, currentColor);
    transition: all 0.2s ease;
  }

  button:hover {
    background: var(--surface-card);
    color: var(--text-high-token);
  }

  button.active {
    background: var(--surface-action);
    border-color: var(--border-int-token);
    color: var(--text-high-token);
  }

  .canvas {
    flex: 1;
    overflow: auto;
    position: relative;
  }
</style>
