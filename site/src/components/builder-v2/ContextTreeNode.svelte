<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";
  import ContrastBadge from "../builder/ContrastBadge.svelte";

  interface TreeNode {
    id: string;
    label: string;
    type: "group" | "surface" | "action" | "text";
    children?: TreeNode[];
  }

  let { node, level = 0 } = $props<{ node: TreeNode; level?: number }>();
  const builder = getContext<BuilderState>("builder");
  const themeState = getContext<ThemeState>("theme");
  const configState = getContext<ConfigState>("config");

  let isExpanded = $state(true);
  let isSelected = $derived(builder.selectedSurfaceId === node.id);
  let mode = $derived(themeState.mode);
  let solved = $derived(configState.solved);

  function toggleExpand(e: MouseEvent): void {
    e.stopPropagation();
    isExpanded = !isExpanded;
  }

  function selectNode(): void {
    builder.selectSurface(node.id);
  }

  function handleMouseEnter(): void {
    builder.hoverSurface(node.id);
  }

  function handleMouseLeave(): void {
    builder.hoverSurface(null);
  }
</script>

<div class="tree-node">
  <div
    class="node-row"
    class:selected={isSelected}
    class:surface-action={isSelected}
    onclick={selectNode}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    style="padding-left: {level * 1.5}rem"
    role="button"
    tabindex="0"
    onkeydown={(e) => {
      if (e.key === "Enter") selectNode();
    }}
  >
    <div class="selection-marker" class:visible={isSelected}></div>
    {#if node.children && node.children.length > 0}
      <button class="toggle" onclick={toggleExpand}>
        {isExpanded ? "▼" : "▶"}
      </button>
    {:else}
      <span class="spacer"></span>
    {/if}
    <span class="icon {node.type} {node.type === 'action' ? 'text-link' : ''}"
    ></span>
    <span class="label">{node.label}</span>
    {#if node.type === "surface"}
      <ContrastBadge slug={node.id} {mode} {solved} />
    {/if}
  </div>

  {#if isExpanded && node.children}
    <div class="children">
      {#each node.children as child (child.id)}
        <svelte:self node={child} level={level + 1} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .node-row {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;
    overflow: hidden;
  }

  /* TODO: Use a proper surface class for hover if needed, 
     but for now removing invalid variable usage */
  .node-row:hover {
    /* background: var(--surface-card); */
    background: var(
      --surface-sunken
    ); /* Temporary fix using current surface context? */
  }

  .node-row.selected {
    /* background: var(--surface-action); */
    /* We should apply the class in markup, but for now let's use the computed values 
       if we can't easily change the class structure without breaking layout */
    background-color: var(
      --computed-surface
    ); /* This assumes the class is applied */
  }

  .selection-marker {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--highlight-ring-color, #d946ef);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .selection-marker.visible {
    opacity: 1;
  }

  .toggle {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    width: 1.5rem;
    display: flex;
    justify-content: center;
    font-size: 0.75rem;
  }

  .spacer {
    width: 1.5rem;
  }

  .icon {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    margin-right: 0.5rem;
    background: currentColor;
    opacity: 0.5;
  }

  .icon.surface {
    background: currentColor;
  }
  .icon.group {
    background: transparent;
    border: 1px dashed currentColor;
    border-radius: 2px;
  }
  .icon.action {
    background: currentColor;
  }
  .icon.text {
    background: transparent;
    border: 1px solid currentColor;
  }
</style>
