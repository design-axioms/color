<script lang="ts">
  import { getContext } from 'svelte';
  import type { ConfigState } from '../../lib/state/ConfigState.svelte';
  import SurfaceRow from './SurfaceRow.svelte';

  const configState = getContext<ConfigState>('config');
  let config = $derived(configState.config);

  let newGroupName = $state("");
  let error = $state<string | null>(null);

  function handleError(fn: () => void) {
    try {
      fn();
      error = null;
    } catch (e: any) {
      error = e.message;
      setTimeout(() => error = null, 3000);
    }
  }

  function handleAddGroup() {
    if (newGroupName.trim()) {
      handleError(() => {
        configState.addGroup(newGroupName.trim());
        newGroupName = "";
      });
    }
  }

  // --- Drag and Drop (Groups) ---
  let draggingGroupIndex: number | null = null;

  function handleGroupDragStart(e: DragEvent, index: number) {
    draggingGroupIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ type: "group", index })
      );
    }
  }

  function handleGroupDragOver(e: DragEvent, index: number) {
    e.preventDefault(); // Allow drop
    if (draggingGroupIndex === null || draggingGroupIndex === index) return;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

  function handleGroupDrop(e: DragEvent, index: number) {
    e.preventDefault();

    // Check for surface drop first
    if (e.dataTransfer) {
      try {
        const data = e.dataTransfer.getData("application/json");
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.type === "surface") {
            // Append to end of this group
            const targetSurfaceIndex = config.groups[index].surfaces.length;
            configState.moveSurface(
              parsed.groupIndex,
              parsed.surfaceIndex,
              index,
              targetSurfaceIndex
            );
            return;
          }
        }
      } catch (e) {
        // Ignore parse errors, might be group drag
      }
    }

    if (draggingGroupIndex === null) return;

    handleError(() => {
      configState.moveGroup(draggingGroupIndex!, index);
    });
    draggingGroupIndex = null;
  }
</script>

<div>
  <h3 class="text-strong" style="margin-bottom: 1rem;">Surfaces</h3>

  {#if error}
    <div
      style="padding: 0.75rem; margin-bottom: 1rem; border-radius: 6px; background: var(--hue-error); color: white; font-size: 0.9rem;"
    >
      {error}
    </div>
  {/if}

  <div style="display: flex; flex-direction: column; gap: 2rem;">
    {#if config.groups.length === 0}
      <div
        class="surface-workspace bordered"
        style="padding: 2rem; border-radius: 8px; text-align: center;"
      >
        <p class="text-subtle" style="margin: 0;">
          No groups yet.
        </p>
        <p
          class="text-subtlest"
          style="font-size: 0.85rem; margin-top: 0.5rem;"
        >
          Create a group to start adding surfaces.
        </p>
      </div>
    {/if}

    {#each config.groups as group, groupIndex (group.name)}
      <div
        class="surface-card bordered"
        style="padding: 1rem; border-radius: 8px; cursor: grab;"
        draggable="true"
        ondragstart={(e) => handleGroupDragStart(e, groupIndex)}
        ondragover={(e) => handleGroupDragOver(e, groupIndex)}
        ondrop={(e) => handleGroupDrop(e, groupIndex)}
        role="listitem"
      >
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
        >
          <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
            <span class="text-subtle" style="cursor: grab;">☰</span>
            <input
              type="text"
              value={group.name}
              oninput={(e) =>
                handleError(() =>
                  configState.updateGroup(groupIndex, {
                    name: e.currentTarget.value,
                  })
                )
              }
              class="text-strong"
              style="background: transparent; border: none; font-size: 1.1rem; font-weight: bold; width: 100%;"
            />
          </div>
          <button
            onclick={() => configState.removeGroup(groupIndex)}
            class="text-subtle"
            style="background: transparent; border: none; cursor: pointer; font-size: 1.2rem;"
            title="Remove Group"
          >
            &times;
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          {#each group.surfaces as surface, surfaceIndex (surface.slug)}
            <SurfaceRow {surface} {groupIndex} {surfaceIndex} />
          {/each}

          <button
            onclick={() =>
              handleError(() =>
                configState.addSurface(groupIndex, {
                  slug: `new-surface-${Date.now()}`,
                  label: "New Surface",
                  polarity: "page",
                })
              )
            }
            class="surface-workspace text-subtle bordered"
            style="padding: 0.5rem; border-radius: 6px; margin-top: 0.5rem; cursor: pointer; font-size: 0.9rem; width: 100%; text-align: center;"
          >
            + Add Surface
          </button>
        </div>
      </div>
    {/each}

    <div style="display: flex; gap: 0.5rem;">
      <input
        type="text"
        bind:value={newGroupName}
        placeholder="New Group Name"
        style="flex: 1; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-subtle-token); background: transparent; color: var(--text-high-token);"
      />
      <button
        onclick={handleAddGroup}
        class="surface-action text-strong bordered"
        style="padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;"
      >
        Add Group
      </button>
    </div>
  </div>
</div>
