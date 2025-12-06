<script lang="ts">
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import SurfaceRow from "./SurfaceRow.svelte";

  const configState = getContext<ConfigState>("config");
  let config = $derived(configState.config);

  let newGroupName = $state("");
  let error = $state<string | null>(null);

  function handleError(fn: () => void): void {
    try {
      fn();
      error = null;
    } catch (e: unknown) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = String(e);
      }
      setTimeout(() => (error = null), 3000);
    }
  }

  function handleAddGroup(): void {
    if (newGroupName.trim()) {
      handleError(() => {
        configState.addGroup(newGroupName.trim());
        newGroupName = "";
      });
    }
  }

  // --- Drag and Drop (Groups) ---
  let draggingGroupIndex: number | null = null;

  interface DragData {
    type: "group" | "surface";
    index?: number;
    groupIndex?: number;
    surfaceIndex?: number;
  }

  function handleGroupDragStart(e: DragEvent, index: number): void {
    draggingGroupIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ type: "group", index }),
      );
    }
  }

  function handleGroupDragOver(e: DragEvent, index: number): void {
    e.preventDefault(); // Allow drop
    if (draggingGroupIndex === null || draggingGroupIndex === index) return;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

  function handleGroupDrop(e: DragEvent, index: number): void {
    e.preventDefault();

    // Check for surface drop first
    if (e.dataTransfer) {
      try {
        const data = e.dataTransfer.getData("application/json");
        if (data) {
          const parsed = JSON.parse(data) as DragData;
          if (
            parsed.type === "surface" &&
            typeof parsed.groupIndex === "number" &&
            typeof parsed.surfaceIndex === "number"
          ) {
            // Append to end of this group
            const targetSurfaceIndex = config.groups[index].surfaces.length;
            configState.moveSurface(
              parsed.groupIndex,
              parsed.surfaceIndex,
              index,
              targetSurfaceIndex,
            );
            return;
          }
        }
      } catch {
        // Ignore parse errors, might be group drag
      }
    }

    if (draggingGroupIndex === null) return;

    const srcIndex = draggingGroupIndex;
    handleError(() => {
      configState.moveGroup(srcIndex, index);
    });
    draggingGroupIndex = null;
  }
</script>

<div class="context-tree">
  <div class="tree-header">
    <h3 class="text-strong">Context Tree</h3>
    <p class="text-subtle">Define the hierarchy of surfaces.</p>
  </div>

  {#if error}
    <div class="error-banner bg-error text-strong">
      {error}
    </div>
  {/if}

  <div class="tree-content">
    {#if config.groups.length === 0}
      <div class="empty-state">
        <p class="text-subtle">No groups yet.</p>
        <p class="text-subtlest">Create a group to start adding surfaces.</p>
      </div>
    {/if}

    <ul class="groups-list">
      {#each config.groups as group, groupIndex (group.name)}
        <li
          class="tree-group surface-workspace bordered"
          draggable="true"
          ondragstart={(e) => {
            handleGroupDragStart(e, groupIndex);
          }}
          ondragover={(e) => {
            handleGroupDragOver(e, groupIndex);
          }}
          ondrop={(e) => {
            handleGroupDrop(e, groupIndex);
          }}
        >
          <!-- Group Header -->
          <div class="group-header surface-card">
            <span class="drag-handle text-subtle">⋮⋮</span>
            <input
              type="text"
              value={group.name}
              oninput={(e) => {
                const val = e.currentTarget.value;
                handleError(() => {
                  configState.updateGroup(groupIndex, { name: val });
                });
              }}
              class="group-name-input text-strong"
            />
            <button
              onclick={() => {
                configState.removeGroup(groupIndex);
              }}
              class="icon-button delete-button text-subtle hover-text-error"
              title="Remove Group"
            >
              &times;
            </button>
          </div>

          <!-- Surfaces List -->
          <ul class="group-children">
            {#each group.surfaces as surface, surfaceIndex (surface.slug)}
              <SurfaceRow {surface} {groupIndex} {surfaceIndex} />
            {/each}

            <li class="add-surface-wrapper">
              <button
                onclick={() => {
                  handleError(() => {
                    configState.addSurface(groupIndex, {
                      slug: `new-surface-${Date.now()}`,
                      label: "New Surface",
                      polarity: "page",
                    });
                  });
                }}
                class="add-surface-button text-subtle"
              >
                + Add Surface
              </button>
            </li>
          </ul>
        </li>
      {/each}
    </ul>

    <!-- Add Group Footer -->
    <div class="add-group-row">
      <input
        type="text"
        bind:value={newGroupName}
        placeholder="New Group Name"
        class="new-group-input bordered text-strong"
        onkeydown={(e) => {
          if (e.key === "Enter") handleAddGroup();
        }}
      />
      <button onclick={handleAddGroup} class="add-group-button surface-action">
        Add Group
      </button>
    </div>
  </div>
</div>

<style>
  .context-tree {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tree-header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .tree-header p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
  }

  .error-banner {
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .tree-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .groups-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .empty-state {
    padding: 2rem;
    border: 1px dashed var(--computed-border-dec-color);
    border-radius: 8px;
    text-align: center;
  }

  /* Group Styling */
  .tree-group {
    border-radius: 8px;
    overflow: hidden;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--computed-border-dec-color);
  }

  .drag-handle {
    cursor: grab;
    font-size: 1.2rem;
    line-height: 1;
  }

  .group-name-input {
    flex: 1;
    background: transparent;
    border: none;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .group-name-input:focus {
    outline: none;
    text-decoration: underline;
  }

  .icon-button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0 0.25rem;
  }

  .group-children {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
  }

  .add-surface-wrapper {
    display: contents;
  }

  .add-surface-button {
    background: transparent;
    border: 1px dashed var(--computed-border-dec-color);
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    transition: all 0.2s;
  }

  .add-surface-button:hover {
    border-color: currentColor;
    color: currentColor;
  }

  /* Add Group Row */
  .add-group-row {
    display: flex;
    gap: 0.5rem;
  }

  .new-group-input {
    flex: 1;
    padding: 0.5rem;
    border-radius: 4px;
    background: transparent;
  }

  .add-group-button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }
</style>
