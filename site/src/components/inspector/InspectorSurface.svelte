<script lang="ts">
  import { getContext } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  const inspector = getContext<{
    select: (el: HTMLElement) => void;
    selected: HTMLElement | null;
  }>("inspector");

  let {
    children,
    class: className,
    ...rest
  } = $props<HTMLAttributes<HTMLDivElement>>();

  let element = $state<HTMLElement>();
  let isSelected = $derived(element && inspector.selected === element);

  function handleClick(e: MouseEvent): void {
    e.stopPropagation();
    if (element) inspector.select(element);
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (element) inspector.select(element);
    }
  }
</script>

<div
  bind:this={element}
  class={(["inspector-surface", className || ""] as string[])
    .filter((c) => !!c)
    .join(" ")}
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={handleKeydown}
  style:anchor-name={isSelected ? "--inspector-anchor" : undefined}
  {...rest}
>
  {@render children?.()}
</div>

<style>
  .inspector-surface {
    cursor: pointer;
    transition: outline 0.2s;
    display: block;
  }

  .inspector-surface:hover {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
    z-index: 10;
    position: relative;
  }

  /* Only show outline on the deepest hovered element */
  :global(.inspector-surface:hover:has(.inspector-surface:hover)) {
    outline: none;
  }

  .inspector-surface:focus-visible {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
  }
</style>
