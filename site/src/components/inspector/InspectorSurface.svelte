<script lang="ts">
  import { getContext } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  
  const inspector = getContext<{ select: (el: HTMLElement) => void }>('inspector');
  
  let { children, class: className, ...rest } = $props() as HTMLAttributes<HTMLDivElement>;
  
  let element: HTMLElement;
  
  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    inspector.select(element);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inspector.select(element);
    }
  }
</script>

<div 
  bind:this={element}
  class={["inspector-surface", className].filter(Boolean).join(" ")}
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={handleKeydown}
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
  
  .inspector-surface:focus-visible {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
  }
</style>
