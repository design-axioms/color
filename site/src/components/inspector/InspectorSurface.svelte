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
  }: HTMLAttributes<HTMLButtonElement> = $props();

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

<!-- eslint-disable-next-line svelte/valid-compile -->
<button
  type="button"
  bind:this={element}
  class={(["inspector-surface", className || ""] as string[])
    .filter((c) => !!c)
    .join(" ")}
  onclick={handleClick}
  onkeydown={handleKeydown}
  style:anchor-name={isSelected ? "--inspector-anchor" : undefined}
  {...rest}
>
  {@render children?.()}
</button>

<style>
  .inspector-surface {
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    box-sizing: border-box;
    width: 100%;
    cursor: pointer;
    transition: outline 0.2s;
    display: block;
    text-align: inherit;
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
