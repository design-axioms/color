<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import AbstractView from "./stage/AbstractView.svelte";
  import AuditView from "./stage/AuditView.svelte";
  import ComponentView from "./stage/ComponentView.svelte";

  const builder = getContext<BuilderState>("builder");
</script>

<div class="panel">
  <h2>Stage ({builder.viewMode})</h2>
  <div class="controls">
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

  .controls {
    padding: 0.5rem;
    border-bottom: 1px solid var(--border-dec-token);
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.25rem 0.75rem;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 0.875rem;
  }

  button:hover {
    background: var(--surface-card);
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
