<script lang="ts">
  import { getContext } from "svelte";
  import type { ThemeMode } from "@axiomatic-design/color/browser";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";
  import ComponentView from "./stage/ComponentView.svelte";
  import ContextTrace from "./stage/ContextTrace.svelte";
  import ExportView from "./stage/ExportView.svelte";

  const builder = getContext<BuilderState>("builder");
  const theme = getContext<ThemeState>("theme");
</script>

<div class="panel surface-page">
  <div class="toolbar">
    <div class="group left">
      <button
        class:active={builder.isSidebarOpen}
        class:surface-action={builder.isSidebarOpen}
        class:text-inverse={builder.isSidebarOpen}
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
      <div class="view-toggle surface-card preset-bordered">
        <button
          class:active={builder.viewMode === "component"}
          class:surface-action={builder.viewMode === "component"}
          class:text-inverse={builder.viewMode === "component"}
          onclick={() => {
            builder.setViewMode("component");
          }}
        >
          Preview
        </button>
        <button
          class:active={builder.viewMode === "export"}
          class:surface-action={builder.viewMode === "export"}
          class:text-inverse={builder.viewMode === "export"}
          onclick={() => {
            builder.setViewMode("export");
          }}
        >
          Export
        </button>
      </div>
    </div>

    <div class="group right">
      <div class="mode-select surface-card preset-bordered">
        <select
          aria-label="Theme Mode"
          data-testid="studio-theme-mode"
          value={theme.mode}
          onchange={(e) => {
            theme.setMode(e.currentTarget.value as ThemeMode);
          }}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <button
        class:active={builder.isInspectorOpen}
        class:surface-action={builder.isInspectorOpen}
        class:text-inverse={builder.isInspectorOpen}
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
      outline: 2px solid CanvasText !important;
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
  }

  .toolbar {
    position: relative;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .toolbar::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: currentColor;
    opacity: 0.12;
  }

  .group {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .mode-select {
    display: flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 6px;
    height: 32px;
  }

  .mode-select select {
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 0.875rem;
    height: 28px;
    padding: 0 0.25rem;
    cursor: pointer;
  }

  .mode-select select:focus {
    outline: 1px solid currentColor;
    outline-offset: 2px;
  }

  .view-toggle {
    display: flex;
    padding: 2px;
    border-radius: 6px;
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
    color: inherit;
    opacity: 0.8;
  }

  .view-toggle button:hover {
    background: transparent;
    opacity: 1;
  }

  .view-toggle button.active {
    opacity: 1;
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
    outline: 1px solid currentColor;
    outline-offset: -1px;
  }

  button.active {
    outline: 1px solid currentColor;
    outline-offset: -1px;
  }

  .canvas {
    flex: 1;
    overflow: auto;
    position: relative;
  }
</style>
