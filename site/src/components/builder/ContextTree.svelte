<script lang="ts">
  import { configState } from "../../lib/state/ConfigState.svelte";
  import ContextTreeNode from "./ContextTreeNode.svelte";

  // Define the TreeNode interface locally to match ContextTreeNode
  interface TreeNode {
    id: string;
    label: string;
    type: "group" | "surface" | "action" | "text";
    children?: TreeNode[];
  }

  // Transform ConfigState into Tree Data
  const treeData = $derived.by(() => {
    const root: TreeNode = {
      id: "root",
      label: "System",
      type: "group",
      children: configState.config.groups.map((group, gIdx) => ({
        id: `group-${gIdx}`,
        label: group.name,
        type: "group",
        children: group.surfaces.map((surface) => ({
          id: surface.slug,
          label: surface.label,
          type: "surface",
          children: [], // Surfaces are leaves in this view for now
        })),
      })),
    };
    return root;
  });
</script>

<div class="context-tree">
  {#if treeData.children}
    {#each treeData.children as group (group.id)}
      <ContextTreeNode node={group} />
    {/each}
  {/if}
</div>

<style>
  .context-tree {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    padding: 0.5rem;
  }
</style>
