<script lang="ts">
  import { getContext } from "svelte";
  import type { BuilderState } from "../../lib/state/BuilderState.svelte";

  interface TreeNode {
    id: string;
    label: string;
    type: "group" | "surface" | "action" | "text";
    children?: TreeNode[];
  }

  let { node, level = 0 } = $props<{ node: TreeNode; level?: number }>();
  const builder = getContext<BuilderState>("builder");

  let isExpanded = $state(true);
  let isSelected = $derived(builder.selectedSurfaceId === node.id);

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
    {#if node.children && node.children.length > 0}
      <button class="toggle" onclick={toggleExpand}>
        {isExpanded ? "▼" : "▶"}
      </button>
    {:else}
      <span class="spacer"></span>
    {/if}
    <span class="icon {node.type}"></span>
    <span class="label">{node.label}</span>
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
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    user-select: none;
    border-radius: 4px;
  }

  .node-row:hover {
    background: var(--surface-card);
  }

  .node-row.selected {
    background: var(--surface-action);
    color: var(--text-high-token);
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
    background: var(--text-high-token);
  }
  .icon.group {
    background: transparent;
    border: 1px dashed currentColor;
    border-radius: 2px;
  }
  .icon.action {
    background: var(--text-link); /* Or brand hue */
  }
  .icon.text {
    background: transparent;
    border: 1px solid currentColor;
  }
</style>
